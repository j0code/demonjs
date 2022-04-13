import { client } from "../main.mjs"
import * as save from "../save.mjs"
import MagicMap from "../util/magicmap.mjs"

var saveData = await save.load("word_count", true) || await save.load("backup/word_count", true) || {}

let words
let users
let total

export default class WordCount {

	constructor() {
		save.write("backup/word_count", saveData)

		words      = MagicMap.fromObject(saveData.words)
		users      = MagicMap.fromObject(saveData.users, {fromObject: o => {
			return { total: o.total, words: MagicMap.fromObject(o.words)}
		}})
		total      = saveData.total || 0

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
			if(i.type == "APPLICATION_COMMAND" && i.commandName == "wordcount") {
				let user = i.options.getUser("user")
				let o
				let s = []
				let totalcount

				if(user) {
					if(!users.has(user.id)) return i.reply({content: "User did not chat yet :/", ephemeral: true, fetchReply: false})
					let usercount = users.get(user.id)
					o = usercount.words.toJSON()
					totalcount = usercount.total
				} else {
					o = words.toJSON()
					totalcount = total
				}

				let arr = Array.from(Object.entries(o))
				arr.sort((a,b) => b[1] - a[1])
				for(let i = 0; i < arr.length && i < 10; i++) {
					const emojis = ["🥇","🥈","🥉"]
					s.push(`${emojis[i] || "▫️"} \`${arr[i][0]}\`: ${arr[i][1]} *(${percent(arr[i][1], totalcount)}%)*`)
				}

				if(!s) i.reply({content: "Error: empty list", ephemeral: false, fetchReply: true})
				.then(msg => msg.react("❌"))
				else i.reply({content: `**TOTAL: ${totalcount}**${user ? ` *(${percent(totalcount, total)}% of global)*` : ""}\n${s.join("\n")}`, ephemeral: false, fetchReply: true})
				.then(msg => msg.react("❌"))

				function percent(a, b) {
					return Math.floor(a / b * 1000) / 10
				}
			}
		})

	}

}

function writeSave() {
	save.write("word_count", {words, users, total})
}
