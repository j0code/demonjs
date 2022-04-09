import { client } from "../main.mjs"
import * as save from "../save.mjs"
import MagicMap from "../util/magicmap.mjs"

var saveData = await save.load("word_count", true) || await save.load("backup/word_count", true) || {}
save.write("backup/word_count", saveData)

let words

export default class WordCount {

	constructor() {
		words = MagicMap.fromObject(saveData.words)

		client.on("messageCreate", msg => {
			if(msg.author.id == client.user.id) return
			let wordlist  = msg.cleanContent.split(/\s/g)
			let counts = {}
			for(let word of wordlist) {
				word = word.toLowerCase()
				word = word.replaceAll(/[!"§$%&/()=?'`^°{[\]}+*~#'<>|,;\.:-_]/g, "")
				if(word.length == 0) continue
				counts[word] = counts[word] || 0
				counts[word]++
				let count = words.get(word) || 0
				count++
				words.set(word, count)
			}

			if(msg.content == "word count") {
				let o = words.toObject()
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
	save.write("word_count", {words: words.toObject()})
}
