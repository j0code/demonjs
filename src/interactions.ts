import fs from "fs/promises"
import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v10"
import YSON from "@j0code/yson"
import { AnsiCode, Logger } from "./logger.js"

const rest = new REST({version: "10"})

const path = "./interactions"
const files = await fs.readdir(path)
let cmds: any[] = []

const logger = new Logger("commands")

for (let f of files) {
	if (!f.endsWith(".yson")) continue

	let data = ""
	try {
		data = await fs.readFile(path + "/" + f, { encoding: "utf-8" })
	} catch (e) {
		logger.log({ name: "error", emoji: "❌", color: AnsiCode.fg_red }, `load ${f}:`, e)
		continue
	}
	if (data) {
		try {
			data = await YSON.parse(data)
			cmds = cmds.concat(data)
		} catch (e) {
			logger.log({ name: "error", emoji: "❌", color: AnsiCode.fg_red }, `load ${f}:`, e)
		}
	}
}

export async function updateAppCommands(token: string, id: string | undefined) {
	if (!id) return
	//console.log("Commands:", cmds)
	rest.setToken(token)
	try {
		logger.log({ name: "info", emoji: " ℹ", color: AnsiCode.fg_white }, `refreshing application (/) commands...`)
		await rest.put(Routes.applicationCommands(id as `${bigint}`), { body: cmds })
		logger.log({ name: "info", emoji: " ℹ", color: AnsiCode.fg_white }, `refreshed application (/) commands!`)
	} catch (e) {
		logger.log({ name: "error", emoji: "❌", color: AnsiCode.fg_red }, `refreshing application (/) commands:`, e)
	}
}
