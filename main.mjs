import * as Discord from 'discord.js'
import Commands from "./customcommands/customcommands.mjs"
import { appCommands } from "./customcommands/customcommands.mjs"
import Stalk from "./stalk/stalk.mjs"
import UserManager from "./usermanager/usermanager.mjs"
import StatusBadger from "./statusbadger/statusbadger.mjs"
import WordCount from "./word_counter/word_count.mjs"
//import * as rpc from "./rpc.mjs" doesn't work + no documentation bruh
import * as typing from "./typing/typing.mjs"
import logEvents from "./eventlogger.mjs"
import * as Interactions from "./interactions.mjs"
import * as debug_console from "./debug_console.mjs"
import { logStalkEvents } from "./logger.mjs"
import config from "./config-loader.mjs"

export const client = new Discord.Client(config.clientOptions)
const commands = new Commands()
export const stalk = new Stalk()
export const usermanager = new UserManager()
const statusbadger = new StatusBadger(client, stalk)
const wordcount = new WordCount()

const activities = {
	global: [
		{ name: "you", type: "WATCHING", url: "https://youtu.be/d1YBv2mWll0" },
		{ name: "sus", type: "PLAYING", url: "https://youtu.be/d1YBv2mWll0" },
		{ name: "dog", type: "WATCHING", url: "https://youtu.be/d1YBv2mWll0" },
		{ name: "EDM", type: "LISTENING", url: "https://youtu.be/d1YBv2mWll0" },
		{ name: "ratio", type: "PLAYING", url: "https://youtu.be/d1YBv2mWll0" },
		{ name: "amogus", type: "PLAYING", url: "https://youtu.be/d1YBv2mWll0" },
		{ name: "Klondike", type: "PLAYING", url: "https://youtu.be/d1YBv2mWll0" },
		{ name: "a game 🧩", type: "PLAYING", url: "https://youtu.be/d1YBv2mWll0" },
		{ name: "polish cow", type: "LISTENING", url: "https://youtu.be/d1YBv2mWll0" },
		{ name: "gelbe Karte", type: "PLAYING", url: "https://youtu.be/d1YBv2mWll0" },
		{ name: "gnome-mines", type: "PLAYING", url: "https://youtu.be/d1YBv2mWll0" },
		{ name: "a bot duel", type: "COMPETING", url: "https://youtu.be/d1YBv2mWll0" },
		{ name: "/ commands", type: "LISTENING", url: "https://youtu.be/d1YBv2mWll0" },
		{ name: "development", type: "WATCHING", url: "https://youtu.be/d1YBv2mWll0" },
		{ name: "your privacy", type: "WATCHING", url: "https://youtu.be/d1YBv2mWll0" },
		{ name: "smashing bugs", type: "PLAYING", url: "https://youtu.be/d1YBv2mWll0" },
		{ name: "custom commands", type: "LISTENING", url: "https://youtu.be/d1YBv2mWll0" },
		{ name: "polish cow dance", type: "WATCHING", url: "https://youtu.be/d1YBv2mWll0" },
		{ name: "a drawing contest", type: "COMPETING", url: "https://youtu.be/d1YBv2mWll0" },
		{ name: "all sorts of events", type: "LISTENING", url: "https://youtu.be/d1YBv2mWll0" },
		{ name: "superiority over Server System™", type: "WATCHING", url: "https://youtu.be/d1YBv2mWll0" }
	]
}

client.on("ready", () => {
	Interactions.updateAppCommands(config.token, client.user.id, appCommands)
	setInterval(loop, 5000) // run loop every 5 seconds

	setRandomPresence()
	setInterval(setRandomPresence, 9000)

	function setRandomPresence() {
		let i = Math.floor(Math.random() * activities.global.length)
		client.user.setPresence({
			activities: [activities.global[i]]
		})
	}
})

client.on("messageCreate", msg => {
	if(msg.content.startsWith("stalk")) {
		var id = msg.content.substr(6)
		if(isNaN(id)) id = id.substring(2, id.length - 1) // strip <@ >
		if(isNaN(id)) id = id.substring(1) // string ! of <@! >
		if(isNaN(id)) return msg.reply("Syntax: `stalk id|@mention`")
		var user = client.users.cache.get(id)
		if(!user) return msg.reply("Unknown user.")
		var stalkUser = stalk.getUser(id)
		if(!stalkUser) return msg.reply(`**${user.tag} Stalk Info**\nStatus: unknown\nActive: false\nLast seen: Never`)
		msg.reply(`**${user.tag} Stalk Info**\nStatus: ${stalkUser.status || "unknown"}\nActive: ${stalkUser.active}\nLast seen: ${stalkUser.active ? "Now" : new Date(stalkUser.lastSeen).toLocaleString()}`)
	}
})

function loop() {
	stalk.update()
	typing.update()
}

stalk.on("active", (user) => {
	//if(user.user?.bot) return
	//client.channels.cache.get("859423943442038829").send(`<:snowden:919332646268588072> ${user.user.username} is now active!`)
})
stalk.on("inactive", (user) => {
	//if(user.user?.bot) return
	//client.channels.cache.get("859423943442038829").send(`<:musslos:859431360711491635>️ ${user.user.username} is now inactive!`)
})

typing.listen()
logEvents(client)
logStalkEvents()
client.login(config.token)
