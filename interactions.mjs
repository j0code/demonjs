import fs from "fs/promises"
import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v9"
import YSON from "@j0code/yson"
import { client } from "./main.mjs"

const rest = new REST({version: 9})

let path = "./interactions"
let files = await fs.readdir(path)
let list = []

for (let f of files) {
	if (!f.endsWith(".yson")) continue

	let data = ""
	try {
		data = await fs.readFile(path + "/" + f, { encoding: "utf-8" })
	} catch (e) {
		console.error(`[interactions.mjs] load ${f}:`, e)
		continue
	}
	if (data) {
		try {
			data = await YSON.parse(data)
			console.log(data)
		} catch (e) {
			console.error(`load ${f}:`, e)
		}
	}
}

export async function updateAppCommands(token, id, appCommands) {
  rest.setToken(token)
  try {
    console.log('Started refreshing application (/) commands.')

    await rest.put(
      Routes.applicationCommands(id),
      { body: appCommands },
    )

    console.log('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.error(error)
  }
}
