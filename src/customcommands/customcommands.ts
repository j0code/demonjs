import { DiscordAPIError, Message } from "discord.js"
import fs from "fs"
import { client } from "../main.js"

type Command = {
	content: string,
	reply: boolean,
	reaction: string,
	delmsg: boolean
}

let commands: Map<string, Command> = new Map()
try {
	let data = JSON.parse(fs.readFileSync("./commands.json", "utf8"))
	commands = new Map(data)
	console.log("Loaded commands!")
} catch(e) {
	commands = new Map()
}
console.log({commands})

export default class Commands {

	constructor() {

		client.on("interactionCreate", i => {
		  if(!i.isCommand()) return
		  if(i.commandName == "command") {
		    if(i.options.getSubcommand() == "set") {

		      let name = i.options.getString("name") || ""
		      let content = i.options.getString("content") || ""
		      let reply = i.options.getBoolean("reply") ?? true
		      let reaction = i.options.getString("reaction") || ""
		      let delmsg = i.options.getBoolean("delmsg") ?? false
		      if(delmsg) reply = false // can't reply to deleted message
		      if(!content && !reaction) { i.reply({ ephemeral: true, content: "You have to specify at least one of: content, reaction" }); return }
		      if(!content && reaction && delmsg) { i.reply({ ephemeral: true, content: "delmsg can not be used together with reaction-only command" }); return }
		      console.log(`command set: "${name}", "${content}", ${reply}, "${reaction}, ${delmsg}`)
		      let cmd: Command = { content, reply, reaction, delmsg }
		      commands.set(name, cmd)
		      i.reply({ ephemeral: true, content: `**Created command '${name}'!**\n${"```"}yml\n${getInfoString(cmd)+"```"}` })
		      saveCommands()

		    } else if(i.options.getSubcommand() == "list") {

		      let names = []
		      for(let name of commands.keys()) names.push(name)
		  		if(names.length > 0) i.reply({ ephemeral: true, content: "```js\n" + names.join(", ") + "```" })
		  		else i.reply({ ephemeral: true, content: "https://cdn.discordapp.com/attachments/580366338133065738/914289479060181042/empathy_banana.png" })

		    } else if(i.options.getSubcommand() == "info") {

		      let name = i.options.getString("name") || ""
		      if(commands.has(name)) {
		        let cmd: Command | undefined = commands.get(name)
		        i.reply({ ephemeral: true, content: `**Info for '${name}'**\n${"```"}yml\n${getInfoString(cmd)+"```"}` })
		      } else i.reply({ ephemeral: true, content: "Unknown command." })

		    } else if(i.options.getSubcommand() == "delete") {

		      let name = i.options.getString("name") || ""
		      if(commands.has(name)) {
		        commands.delete(name)
		        i.reply({ ephemeral: true, content: `**Deleted command '${name}'!**` })
		      } else i.reply({ ephemeral: true, content: "Unknown command." })

		    } else if(i.options.getSubcommand() == "edit") {

		      let name = i.options.getString("name") || ""
		      let content = i.options.getString("content") || ""
		      let reply: boolean | null = i.options.getBoolean("reply")
		      let reaction = i.options.getString("reaction") || ""
		      let delmsg = i.options.getBoolean("delmsg")
		      if(delmsg) reply = false // can't reply to deleted message
		      //if(!content && !reaction) { i.reply({ ephemeral: true, content: "You have to specify at least one of: content, reaction" }); return }
		      console.log(`command edit: "${name}", "${content}", ${reply}, "${reaction}"`)
		      let cmd: Command | undefined = commands.get(name)
			  if (!cmd) { i.reply({ ephemeral: true, content: "Unknown command. Try `/command set` instead" }); return }
		      if(!content && !cmd.content && (reaction || cmd.reaction) && delmsg) { i.reply({ ephemeral: true, content: "delmsg can not be used together with reaction-only command" }); return }
		      i.reply({ ephemeral: true, content: `**Command '${name}' edited!**\nBefore:${"```"}yml\n${getInfoString(cmd)}${"```"}\After:${"```"}yml\n${getInfoString({reply: reply ?? cmd.reply, content, reaction, delmsg: delmsg ?? cmd.delmsg })}${"```"}` })
		      if(content) cmd.content = content
		      if(reply != undefined) cmd.reply = reply
		      if(reaction) cmd.reaction = reaction
		      if(delmsg != undefined) cmd.delmsg = delmsg
		      commands.set(name, cmd)
		      saveCommands()

		    } //else i.reply({ ephemeral: true, content: "Not yet implemented." })
		  } //else i.reply({ ephemeral: true, content: "Not yet implemented." })
		})

		client.on("messageCreate", msg => {
		  let name = ""
		  for(let k of commands.keys()) if(msg.content.startsWith(k)) {name = k; break}
		  if(!name) return
		  let cmd: Command | undefined = commands.get(name)
		  if (!cmd) return
		  let s = msg.content.substring(name.length)
		  if(s.startsWith(" ")) s = s.substr(1)
		  let args = s.split(" ")
		  if(cmd.content) {
		    let react = (m: Message) => {
		    	if (cmd?.reaction) m.react(substDollar(cmd.reaction, name, args, msg, true))
		    	.catch(e => msg.reply("Invalid reaction: " + cmd?.reaction))
		    }
		    if(cmd.reply) msg.reply(substDollar(cmd.content, name, args, msg, false)).then(react)
		    else msg.channel.send(substDollar(cmd.content, name, args, msg, false)).then(react)
		    if(cmd.delmsg) msg.delete()
		    .catch(e => {
		      msg.channel.send("Error: Unable to delete msg.")
		      console.log("Error when deleting msg:", e)
		    })
		  } else if(cmd.reaction) {
		    msg.react(substDollar(cmd.reaction, name, args, msg, true))
		    .catch(e => msg.reply("Invalid reaction: " + cmd?.reaction))
		  }
		})

	}

}

function getInfoString(cmd: Command | undefined) {
	if (!cmd) return "unknown command"
	 let s = "reply: " + cmd.reply + "\ndelmsg: " + cmd.delmsg
	s += (cmd.content ? "\ncontent: " + cmd.content : "")
	s += (cmd.reaction ? "\nreaction: " + cmd.reaction : "")
	return s
}

function saveCommands() {
  fs.writeFile("./commands.json", JSON.stringify(Array.from(commands)), {encoding: "utf8"}, e => {
		if(e) console.error("Error writing commands:", e)
		else console.log("Saved commands!")
	})
}

function getTimeString() {
	let now = new Date();
	let s = now.getSeconds();
	let min = now.getMinutes();
	let h = now.getHours();
	return (h < 10 ? "0"+h : h) + ":" + (min < 10 ? "0"+min : min) + ":" + (s < 10 ? "0"+s : s)
}

function getDateString() {
	let now = new Date();
	let d = now.getDate();
	let m = now.getMonth() +1;
	let y = now.getFullYear();
	return y + "/" + (m < 10 ? "0"+m : m) + "/" + (d < 10 ? "0"+d : d)
}

function substDollar(r: string, name: string, args: string[], msg: Message, nospecial: boolean) {
	let a = r.split("")
	for(let i = 0; i < a.length; i++) {
			let i0 = i
			if(a[i] != "$") continue
			if(a[i+1] == "$") { a.splice(i, 1, ""); i++; continue }
			let n = ""
			let v = ""
			i++
			if(!nospecial && a[i] == "*") {v = args.join(" "); n = "*"; i++}
			else if(!nospecial && a[i] == "u") {v = msg.author.tag; n = "u"; i++}
			else if(!nospecial && a[i] == "m") {v = "<@" + msg.author.id + ">"; n = "m"; i++}
			else if(!nospecial && a[i] == "d") {v = getDateString(); n = "d"; i++}
			else if(!nospecial && a[i] == "t") {v = getTimeString(); n = "t"; i++}
			else if(!nospecial && a[i] == "n") {v = "\n"; n = "n"; i++}
			else {
					while(!isNaN(Number(a[i])) && a[i].trim() != "") {console.log(a[i], n, i);n += a[i]; i++}
			}
		if(!v && n) {
			v = (n == "0" ? name : args[Number(n)-1]) || ""
		}
		a.splice(i0, n.length+1, v)
		i=i0
	}
	return a.join("")
}
