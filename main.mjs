import * as Discord from 'discord.js'
import YSON from "@j0code/yson"
import Commands from "./customcommands/customcommands.mjs"
import { appCommands } from "./customcommands/customcommands.mjs"
import Stalk from "./stalk/stalk.mjs"
import UserManager from "./usermanager/usermanager.mjs"
import StatusBadger from "./statusbadger/statusbadger.mjs"
import WordCount from "./word_counter/word_count.mjs"
import wordCountCommands from "./word_counter/commands.mjs"
import EmbedCmd from "./embeds/embedcmd.mjs"
import embedCommands from "./embeds/commands.mjs"
//import * as rpc from "./rpc.mjs" doesn't work + no documentation bruh
import * as typing from "./typing/typing.mjs"
import logEvents from "./eventlogger.mjs"
import * as Interactions from "./interactions.mjs"
import * as debug_console from "./debug_console.mjs"
import { logStalkEvents } from "./logger.mjs"

export const config = await YSON.load("config.yson")
const activities = await YSON.load("activities.yson")
export const special_ids = await YSON.load("special_ids.yson")

export const client = new Discord.Client(config.clientOptions)
const commands = new Commands()
export const stalk = new Stalk()
export const usermanager = new UserManager()
const statusbadger = new StatusBadger(client, stalk)
const wordcount = new WordCount()
const embedcmd = new EmbedCmd()

client.on("ready", () => {
	let cmds = appCommands.concat(wordCountCommands, embedCommands)
	Interactions.updateAppCommands(config.token, client.user.id, cmds)
	console.log(cmds)
	setInterval(loop, 5000) // run loop every 5 seconds

	setRandomPresence()
	setInterval(setRandomPresence, 9000)

	function setRandomPresence() {
		let i = Math.floor(Math.random() * activities.length)
		client.user.setPresence({
			activities: [activities[i]]
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

client.on("messageReactionAdd", (reaction, user) => {
	reaction.message.fetch()
	.then(msg => reaction.users.fetch())
	.then(users => {
		if(reaction.emoji.name == "❌" && reaction.message.author.id == client.user.id && users.has(client.user.id) && user.id != client.user.id) {
			reaction.message.delete()
		}
	})
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
