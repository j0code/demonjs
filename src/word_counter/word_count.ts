import YSON from "@j0code/yson"
import { AttachmentBuilder, AutocompleteInteraction, ChatInputCommandInteraction, Interaction } from "discord.js"
import { client, special_ids } from "../main.js"
import * as save from "../save.js"
import MagicMap from "../util/magicmap.js"
import { autocomplete } from "../util/util.js"

const saveData = await save.load("word_count", true) || await save.load("backup/word_count", true) || {}

type Language = {
	name: string,
	name_en: string,
	code: string
}

let words: MagicMap<number>
let users: MagicMap<{ words: MagicMap<number>, total: number }>
let total: number
let dictionary: MagicMap<any> // TODO
let languages: MagicMap<Language>

export default class WordCount {

	constructor() {
		save.write("backup/word_count", saveData)

		words      = MagicMap.fromObject(saveData.words)
		users      = MagicMap.fromObject(saveData.users, {fromObject: (o: any) => {
			return { total: o.total, words: MagicMap.fromObject(o.words)}
		}})
		total      = saveData.total || 0
		dictionary = MagicMap.fromObject(saveData.dictionary)
		languages  = MagicMap.fromObject(saveData.languages)

		//console.log("words:", ...words.conarr)
		//console.log("users:", ...users.conarr)

		client.on("messageCreate", msg => {

			let wordlist  = msg.cleanContent.split(/[\s\/\\\,\.\_\-]/g)
			let user = users.get(msg.author.id) || {total: 0, words: new MagicMap()}

			user.total += wordlist.length

			for(let word of wordlist) {
				word = word.toLowerCase()
				word = word.replaceAll(/[\!\"\§\$\%\&\/\\\(\)\=\?\`\´\^\°\{\[\]\}\+\*\~\#\<\>\|\,\;\.\:\-\_1234567890]/g, "")
				if(word.length == 0 || word.length > 50) continue
				if(!msg.author.bot) {
					let globalcount = words.get(word) || 0
					globalcount++
					words.set(word, globalcount)
					total++
				}
				let usercount = user.words.get(word) || 0
				usercount++
				user.words.set(word, usercount)
			}

			users.set(msg.author.id, user)

			writeSave()
		})

		client.on("interactionCreate", (i: Interaction): void => {
			if(i instanceof ChatInputCommandInteraction) {
				if(i.commandName == "wordcount") {

					let user = i.options.getUser("user")
					let word = i.options.getString("word")
					let o
					let s: string[] = []
					let totalcount: number
					let arr: Array<[string, number]> = []

					if (user) {
						if(!users.has(user.id)) {
							i.reply({content: "User did not chat yet :/", ephemeral: true, fetchReply: false})
							return
						}
						let usercount = users.get(user.id)
						o = usercount?.words.toJSON()
						totalcount = usercount?.total || 0
					} else {
						o = words.toJSON()
						totalcount = total
					}

					if (word) {
						if (user) {
							let count = o[word] || 0
							i.reply({content: `**Word: ${word}** (${user.username})\nCount: ${count}\nQuota of user: ${percent(count, totalcount)}%\nQuota of global: ${percent(count, total)}%`, ephemeral: true, fetchReply: false})
							return
						} else {
							let globalcount = o[word] || 0
							totalcount = 0
							for (let e of users) {
								let id = e[0]
								let u = e[1]
								let dcuser = client.users.cache.get(id)
								let name = dcuser ? dcuser.username : `@${id}`
								if (special_ids.webhooks.has(id)) name = special_ids.webhooks.get(id)
								let count = u.words.get(word)
								if (count) {
									arr.push([name, count])
									totalcount += u.words.get(word) || 0
								}
							}
						}
					} else arr = Array.from(Object.entries(o))

					arr.sort((a,b) => b[1] - a[1])
					for(let i = 0; i < arr.length && i < 10; i++) {
						const emojis = ["🥇","🥈","🥉"]
						s.push(`${emojis[i] || "▫️"} \`${arr[i][0]}\`: ${arr[i][1]} *(${percent(arr[i][1], totalcount)}%)*`)
					}

					if(!s) i.reply({content: "Error: empty list", ephemeral: false, fetchReply: true})
					.then(msg => msg.react("❌"))
					else i.reply({content: `**TOTAL: ${totalcount}**${(user || word) ? ` *(${percent(totalcount, total)}% of global)*` : ""}\n${s.join("\n")}`, ephemeral: false, fetchReply: true})
					.then(msg => msg.react("❌"))

				} else if(i.commandName == "words") {

					let user = i.options.getUser("user")
					let format = i.options.getInteger("format") || 0
					let o: any

					if (user) {
						if (!users.has(user.id)) {
							i.reply({content: "User did not chat yet :/", ephemeral: true, fetchReply: false})
							return
						}
						let usercount = users.get(user.id)
						o = usercount?.words.toJSON()
					} else {
						o = words.toJSON()
					}

					let s = ""
					let name = "data.json"
					switch (format) {
						case 0: { // json
							s = JSON.stringify(o)
						}
						break

						case 1: { // yson
							s = YSON.stringify(o)
							name = "data.yson"
						}
						break

						case 2: { // pretty print
							let arr = Object.entries(o).sort((a: [string, any], b: [string, any]) => b[1] - a[1])
							for (let i = 0; i < arr.length; i++) {
								s += `${arr[i][0]}: ${arr[i][1]}`
								if (i < arr.length-1) s += "\n"
							}
							name = "data.txt"
						}
						break

						case 3: { // json (indented)
							s = JSON.stringify(o, null, 2)
						}
						break
					}

					i.reply({ files: [new AttachmentBuilder(Buffer.from(s), { name, description: `Word count data encoded as ${format}` })], ephemeral: true })

					/*o = Object.entries(o).sort((a, b) => b[1] - a[1])
					//let s = JSON.stringify(o)
					if(s.length <= 2000) i.reply({content: `\`\`\`json\n${s}\`\`\``, ephemeral: true, fetchReply: false})
					else {
						i.reply({ files: [new Discord.MessageAttachment(Buffer.from(JSON.stringify(o, null, 2)), "data.json")] })
					}
					// else i.reply({content: `JSON is longer than Discord's character limit (2000).\nIn the future, j0code will make me upload it as a file.\nI sincerely apologize for the inconvenience. `, ephemeral: true, fetchReply: false})
					*/
				} else if(i.commandName == "dictionary") {

					dictionaryCmd(i)

				}
			} else if (i instanceof AutocompleteInteraction) {
				if(i.commandName == "wordcount") {
					let opt = i.options.getFocused(true)

					if(opt.name == "language") {

						i.respond(autocomplete<Language>(languages,
							(k,v) => (v.name.includes(opt.value) || v.name_en.includes(opt.value) || v.code.startsWith(opt.value)),
							(k,v) => ({name: `${v.name} (${v.name_en})`, value: v.code})
						))

					} else if(opt.name == "word") {

						i.respond(autocomplete(words, (k,v) => (k.includes(opt.value) && k.length < 50), (k,v) => ({name: k, value: k})))

					}

				}
			}

			function percent(a: number, b: number) {
				return Math.floor(a / b * 1000) / 10
			}
		})

	}

}

function dictionaryCmd(i: ChatInputCommandInteraction) {

	let subcmd = i.options.getSubcommand()

	if(subcmd == "show") showDict(i, "DICTIONARY", words)
	else if(subcmd == "langs") showLangs(i, "LANGUAGES", languages)
	else if(subcmd == "addlang") addLang(i)
	else i.reply("Oops. You got me. I don't know what to do.")

}

function showDict(i: ChatInputCommandInteraction, title: string, list: MagicMap<number>) {
	let arr = []
	let len = 0

	for(let w of list.keys()) {
		arr.push(w)
		len += w.length + 2
		if(len > 1900) break
	}

	let s = arr.join(", ")
	if(len > 1900) s += ", ..."

	i.reply(`**${title}**\n${s}`)
	// TODO:
	// - Add stats (word count, amount of unidentified words,...)
	// - allow filtering by language
}

function showLangs(i: ChatInputCommandInteraction, title: string, list: MagicMap<Language>) {
	let arr = []
	let len = 0

	console.log(list)

	for(let lang of list.values()) {
		console.log(lang)
		let l = `${lang.name} (${lang.code})`
		arr.push(l)
		len += l.length + 2
		if(len > 1900) break
	}

	let s = arr.join(", ")
	if(len > 1900) s += ", ..."

	i.reply({content: `**${title}**\n${s}`, ephemeral: true})
}

function addLang(i: ChatInputCommandInteraction) {
	if (i.user.id != special_ids.owner) return i.reply({content: "This command is for the bot owner only.", ephemeral: true})

	let code    = i.options.getString("code")
	let name    = i.options.getString("name")
	let name_en = i.options.getString("name_en")

	if (!code || !name || !name_en) return i.reply({content: "Incomplete arguments",              ephemeral: true})
	if (languages.has(code))        return i.reply({content: "This language already exists.",     ephemeral: true})
	if (code.length != 2)           return i.reply({content: "The lang code has to be ISO 639-1", ephemeral: true})

	languages.set(code, {code, name, name_en})

	i.reply({content: `Successfully added lang ${code} (${name}/${name_en})`, ephemeral: true})

	writeSave()
}

function writeSave() {
	save.write("word_count", {words, users, total, dictionary, languages})
}
