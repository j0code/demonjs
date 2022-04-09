import { client } from "../main.mjs"
import * as save from "../save.mjs"

var saveData = await save.load("word_count", true) || await save.load("backup/word_count", true) || {}
save.write("backup/word_count", saveData)

export default class WordCount {

	constructor() {

		client.on("messageCreate", msg => {
			console.log(msg)
		})

	}

}
