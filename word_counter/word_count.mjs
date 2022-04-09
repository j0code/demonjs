import { client } from "../main.mjs"
import * as save from "../save.mjs"
import MagicMap from "../util/magicmap.mjs"

var saveData = await save.load("word_count", true) || await save.load("backup/word_count", true) || {}

let words
let users

export default class WordCount {

	constructor() {
		save.write("backup/word_count", saveData)

		words      = MagicMap.fromObject(saveData.words)
		users      = MagicMap.fromObject(saveData.users)

		//console.log("words:", ...words.conarr)
		//console.log("users:", ...users.conarr)

		client.on("messageCreate", msg => {
			if(msg.author.id == client.user.id) return

			let wordlist  = msg.cleanContent.split(/\s/g)
			let user = users.get(msg.author.id) || {total: 0, words: new MagicMap()}

			user.total += wordlist.length

			for(let word of wordlist) {
				word = word.toLowerCase()
				word = word.replaceAll(/[!"§$%&/()=?'`^°{[\]}+*~#'<>|,;\.:-_]/g, "")
				if(word.length == 0) continue
				let globalcount = words.get(word) || 0
				globalcount++
				words.set(word, globalcount)
				let usercount = user.words.get() || 0
				usercount++
				user.words.set(word, usercount)
			}

			if(msg.content == "word count") {
				let o = words.toJSON()
				let arr = Array.from(Object.entries(o))
				arr.sort((a,b) => b[1] - a[1])
				let s = []
				for(let i = 0; i < arr.length && i < 10; i++) {
					const emojis = ["🥇","🥈","🥉"]
					s.push(`${emojis[i] || "▫️"} ${arr[i][0]}: ${arr[i][1]}`)
				}
				if(s.length > 0) {
					msg.reply(s.join("\n"))
					.then(msg => msg.react("❌"))
				}
			}

			writeSave()
		})

	}

}

function writeSave() {
	save.write("word_count", {words: words, users: users})
}
