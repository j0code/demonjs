import * as Discord from 'discord.js'
import YSON from "@j0code/yson"
import Commands from "./customcommands/customcommands.js"
import Stalk from "./stalk/stalk.js"
import UserManager from "./usermanager/usermanager.js"
import StatusBadger from "./statusbadger/statusbadger.js"
import WordCount from "./word_counter/word_count.js"
import EmbedCmd from "./embeds/embedcmd.js"
import memeCmdInit from "./memes/memes.js"
//import * as rpc from "./rpc.mjs" doesn't work + no documentation bruh
import * as typing from "./typing/typing.js"
import logEvents from "./eventlogger.js"
import * as Interactions from "./interactions.js"
import * as debug_console from "./debug_console.js"
import { logStalkEvents, getLogTimeString } from "./logger.js"
import oauthInit from "./oauth.js"

export const config = await YSON.load("config.yson")
const activities = await YSON.load("activities.yson")
export const special_ids = await YSON.load("special_ids.yson")

export const client = new Discord.Client(config.clientOptions)
const commands = new Commands()
export const stalk = new Stalk()
export const usermanager = new UserManager()
const statusbadger = new StatusBadger()
const wordcount = new WordCount()
const embedcmd = new EmbedCmd()
memeCmdInit()

debug_console // to make typescript import it
oauthInit()

config.clientOptions.sweepers = {
	guildMembers: { interval: 11, filter: () => (v: Discord.GuildMember) => {
		let stalkUser = stalk.getUser(v.id)
		if (!stalkUser) return true
		let sweep = (Date.now() - stalkUser.lastSeen) > 60 * 1000 // last seen 1 min ago
		if (sweep && process.argv[2] == "debug") console.log(`[SWEEP] Sweeping member ${v.user.tag} of ${v.guild.name}!`)
		return sweep
	}},
	messages: { interval: 11, lifetime: 60 * 1000 }, // 1 minute
	users: { interval: 11, filter: () => (v: Discord.User) => {
		let stalkUser = stalk.getUser(v.id)
		if (!stalkUser) return true
		let sweep = (Date.now() - stalkUser.lastSeen) > 60 * 1000 // last seen 1 min ago
		if (sweep && process.argv[2] == "debug") console.log(`[SWEEP] Sweeping user ${v.tag}!`)
		return sweep
	}}
}

client.on("ready", () => {
	Interactions.updateAppCommands(config.token, client?.user?.id)
	setInterval(loop, 5000) // run loop every 5 seconds

	setRandomPresence()
	setInterval(setRandomPresence, 9000)

	function setRandomPresence() {
		let i = Math.floor(Math.random() * activities.length)
		client?.user?.setPresence({
			activities: [activities[i]]
		})
	}

	console.group("Bot in following guilds:")
	for (let g of client.guilds.cache.values()) {
		console.log(`${g.name} (${g.id}) @ ${getLogTimeString()}`)
	}
	console.groupEnd()
})

client.on("messageCreate", (msg): any => {
	if(msg.content.startsWith("stalk")) {
		var id = msg.content.substr(6)
		if(isNaN(Number(id))) id = id.substring(2, id.length - 1) // strip <@ >
		if(isNaN(Number(id))) id = id.substring(1) // string ! of <@! >
		if(isNaN(Number(id))) return msg.reply("Syntax: `stalk id|@mention`")
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
		if(reaction.emoji.name == "❌" && reaction?.message?.author?.id == client?.user?.id && users.has(client?.user?.id || "") && user.id != client?.user?.id) {
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
