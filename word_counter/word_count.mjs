import { client } from "../main.mjs"
import * as save from "../save.mjs"
import MagicMap from "../util/magicmap.mjs"
import special_ids from "../util/special_ids.mjs"

var saveData = await save.load("word_count", true) || await save.load("backup/word_count", true) || {}

let words
let users
let total
let dictionary
let languages

export default class WordCount {

	constructor() {
		save.write("backup/word_count", saveData)

		words      = MagicMap.fromObject(saveData.words)
		users      = MagicMap.fromObject(saveData.users, {fromObject: o => {
			return { total: o.total, words: MagicMap.fromObject(o.words)}
		}})
		total      = saveData.total || 0
		dictionary = MagicMap.fromObject(saveData.dictionary)
		languages  = MagicMap.fromObject(saveData.languages)

		//console.log("words:", ...words.conarr)
		//console.log("users:", ...users.conarr)

		client.on("messageCreate", msg => {

			let wordlist  = msg.cleanContent.split(/\s/g)
			let user = users.get(msg.author.id) || {total: 0, words: new MagicMap()}

			user.total += wordlist.length

			for(let word of wordlist) {
				word = word.toLowerCase()
				word = word.replaceAll(/[\!\"\§\$\%\&\/\\\(\)\=\?\`\´\^\°\{\[\]\}\+\*\~\#\<\>\|\,\;\.\:\-\_1234567890]/g, "")
				if(word.length == 0) continue
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

		client.on("interactionCreate", i => {
			if(i.type == "APPLICATION_COMMAND") {
				if(i.commandName == "wordcount") {

					let user = i.options.getUser("user")
					let word = i.options.getString("word")
					let o
					let s = []
					let totalcount
					let arr = []

					if(user) {
						if(!users.has(user.id)) return i.reply({content: "User did not chat yet :/", ephemeral: true, fetchReply: false})
						let usercount = users.get(user.id)
						o = usercount.words.toJSON()
						totalcount = usercount.total
					} else {
						o = words.toJSON()
						totalcount = total
					}

					if(word) {
						if(user) {
							let count = o[word] || 0
							return i.reply({content: `**Word: ${word}** (${user.username})\nCount: ${count}\nQuota of user: ${percent(count, totalcount)}%\nQuota of global: ${percent(count, total)}%`, ephemeral: true, fetchReply: false})
						} else {
							let globalcount = o[word] || 0
							totalcount = 0
							for(let e of users) {
								let id = e[0]
								let u = e[1]
								let dcuser = client.users.cache.get(id)
								let name = dcuser ? dcuser.username : `@${id}`
								if(special_ids.webhooks[id]) name = special_ids.webhooks[id]
								if(u.words.has(word)) {
									arr.push([name, u.words.get(word)])
									totalcount += u.words.get(word)
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
					let o

					if(user) {
						if(!users.has(user.id)) return i.reply({content: "User did not chat yet :/", ephemeral: true, fetchReply: false})
						let usercount = users.get(user.id)
						o = usercount.words.toJSON()
					} else {
						o = words.toJSON()
					}

					let s = JSON.stringify(o)
					if(s.length <= 2000) i.reply({content: `\`\`\`json\n${s}\`\`\``, ephemeral: true, fetchReply: false})
					else i.reply({content: `JSON is longer than Discord's character limit (2000).\nIn the future, j0code will make me upload it as a file.\nI sincerely apologize for the inconvenience. `, ephemeral: true, fetchReply: false})

				} else if(i.commandName == "dictionary") {

					dictionaryCmd(i)

				}
			} else if(i.type == "APPLICATION_COMMAND_AUTOCOMPLETE") {
				if(i.commandName == "wordcount") {
					let opt = i.options.getFocused(true)

					if(opt.name == "language") {
						let arr = []
						for(let lang of languages.values()) {
							if(lang.name.includes(opt.value) || lang.name_en.includes(opt.value) || lang.code.startsWith(opt.value)) arr.push({name: `${lang.name} (${lang.name_en})`, value: lang.code})
						}
						i.respond(arr)
					}

				}
			}

			function percent(a, b) {
				return Math.floor(a / b * 1000) / 10
			}
		})

	}

}

function dictionaryCmd(i) {

	let subcmd = i.options._subcommand

	if(subcmd == "show") showDict(i, "DICTIONARY", words)
	else if(subcmd == "langs") showLangs(i, "LANGUAGES", languages)
	else if(subcmd == "addlang") addLang(i)
	else i.reply("Oops. You got me. I don't know what to do.")

}

function showDict(i, title, list) {
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

function showLangs(i, title, list) {
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

function addLang(i) {
	if(i.user.id != special_ids.owner) return i.reply({content: "This command is for the bot owner only.", ephemeral: true})

	let code    = i.options.getString("code")
	let name    = i.options.getString("name")
	let name_en = i.options.getString("name_en")

	if(languages.has(code)) return i.reply({content: "This language already exists.",     ephemeral: true})
	if(code.length != 2)    return i.reply({content: "The lang code has to be ISO 639-1", ephemeral: true})

	languages.set(code, {code, name, name_en})

	i.reply({content: `Successfully added lang ${code} (${name}/${name_en})`, ephemeral: true})

	writeSave()
}

function writeSave() {
	save.write("word_count", {words, users, total, dictionary, languages})
}
