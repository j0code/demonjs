import fs from "fs"
import { client } from "../main.mjs"

export const appCommands = [{
  name: "command",
  description: "List guilds",
  options: [{
    type: 1,
    name: "list",
    description: "List commands"
  }, {
    type: 1,
    name: "info",
    description: "Get info about command",
    options: [{
      type: 3,
      name: "name",
      description: "command name",
      required: true
    }]
  }, {
    type: 1,
    name: "set",
    description: "Add or override command",
    options: [{
      type: 3,
      name: "name",
      description: "command name",
      required: true
    }, {
      type: 3,
      name: "content",
      description: "content (try $u $m $d $t $* $0 $1 $2)",
      required: false
    }, {
      type: 5,
      name: "reply",
      description: "reply or just send (default: true)",
      required: false
    }, {
      type: 3,
      name: "reaction",
      description: "emoji to react (when no content, react to original msg)",
      required: false
    }, {
      type: 5,
      name: "delmsg",
      description: "delete the original message (default: false)",
      required: false
    }]
  }, {
    type: 1,
    name: "edit",
    description: "Edit an existing command",
    options: [{
      type: 3,
      name: "name",
      description: "command name",
      required: true
    }, {
      type: 3,
      name: "content",
      description: "content (try $u $m $d $t $* $0 $1 $2)",
      required: false
    }, {
      type: 5,
      name: "reply",
      description: "reply or just send",
      required: false
    }, {
      type: 3,
      name: "reaction",
      description: "emoji to react (when no content, react to original msg)",
      required: false
    }, {
      type: 5,
      name: "delmsg",
      description: "delete the original message",
      required: false
    }]
  }, {
    type: 1,
    name: "delete",
    description: "Delete command",
    options: [{
      type: 3,
      name: "name",
      description: "command name",
      required: true
    }]
  }]
}]

let commands = new Map()
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
		    if(i.options._subcommand == "set") {

		      var name = i.options.getString("name") || ""
		      var content = i.options.getString("content") || ""
		      var reply = i.options.getBoolean("reply") ?? true
		      var reaction = i.options.getString("reaction") || ""
		      var delmsg = i.options.getBoolean("delmsg") ?? false
		      if(delmsg) reply = false // can't reply to deleted message
		      if(!content && !reaction) { i.reply({ ephemeral: true, content: "You have to specify at least one of: content, reaction" }); return }
		      if(!content && reaction && delmsg) { i.reply({ ephemeral: true, content: "delmsg can not be used together with reaction-only command" }); return }
		      console.log(`command set: "${name}", "${content}", ${reply}, "${reaction}, ${delmsg}`)
		      var cmd = { content, reply, reaction, delmsg }
		      commands.set(name, cmd)
		      i.reply({ ephemeral: true, content: `**Created command '${name}'!**\n${"```"}yml\n${getInfoString(cmd)+"```"}` })
		      saveCommands()

		    } else if(i.options._subcommand == "list") {

		      var names = []
		      for(var name of commands.keys()) names.push(name)
		  		if(names.length > 0) i.reply({ ephemeral: true, content: "```js\n" + names.join(", ") + "```" })
		  		else i.reply({ ephemeral: true, content: "https://cdn.discordapp.com/attachments/580366338133065738/914289479060181042/empathy_banana.png" })

		    } else if(i.options._subcommand == "info") {

		      var name = i.options.getString("name") || ""
		      if(commands.has(name)) {
		        var cmd = commands.get(name)
		        i.reply({ ephemeral: true, content: `**Info for '${name}'**\n${"```"}yml\n${getInfoString(cmd)+"```"}` })
		      } else i.reply({ ephemeral: true, content: "Unknown command." })

		    } else if(i.options._subcommand == "delete") {

		      var name = i.options.getString("name") || ""
		      if(commands.has(name)) {
		        commands.delete(name)
		        i.reply({ ephemeral: true, content: `**Deleted command '${name}'!**` })
		      } else i.reply({ ephemeral: true, content: "Unknown command." })

		    } else if(i.options._subcommand == "edit") {

		      var name = i.options.getString("name") || ""
		      var content = i.options.getString("content") || ""
		      var reply = i.options.getBoolean("reply")
		      var reaction = i.options.getString("reaction") || ""
		      var delmsg = i.options.getBoolean("delmsg")
		      if(delmsg) reply = false // can't reply to deleted message
		      //if(!content && !reaction) { i.reply({ ephemeral: true, content: "You have to specify at least one of: content, reaction" }); return }
		      console.log(`command edit: "${name}", "${content}", ${reply}, "${reaction}"`)
		      if(!commands.has(name)) { i.reply({ ephemeral: true, content: "Unknown command. Try `/command set` instead" }); return }
		      var cmd = commands.get(name)
		      if(!content && !cmd.content && (reaction || cmd.reaction) && delmsg) { i.reply({ ephemeral: true, content: "delmsg can not be used together with reaction-only command" }); return }
		      i.reply({ ephemeral: true, content: `**Command '${name}' edited!**\nBefore:${"```"}yml\n${getInfoString(cmd.reply)}${"```"}\After:${"```"}yml\n${getInfoString({reply, content, reaction, delmsg})}${"```"}` })
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
		  var name = ""
		  for(var k of commands.keys()) if(msg.content.startsWith(k)) {name = k; break}
		  if(!name) return
		  var cmd = commands.get(name)
		  var s = msg.content.substr(name.length)
		  if(s.startsWith(" ")) s = s.substr(1)
		  var args = s.split(" ")
		  if(cmd.content) {
		    var react = m => {
		      if(cmd.reaction) m.react(substDollar(cmd.reaction, name, args, msg, true))
		      .catch(e => msg.reply("Invalid reaction: " + cmd.reaction))
		    }
		    if(cmd.reply) msg.reply(substDollar(cmd.content, name, args, msg)).then(react)
		    else msg.channel.send(substDollar(cmd.content, name, args, msg)).then(react)
		    if(cmd.delmsg) msg.delete()
		    .catch(e => {
		      msg.channel.send("Error: Unable to delete msg.")
		      console.log("Error when deleting msg:", e)
		    })
		  } else if(cmd.reaction) {
		    msg.react(substDollar(cmd.reaction, name, args, msg, true))
		    .catch(e => msg.reply("Invalid reaction: " + cmd.reaction))
		  }
		})

	}

}

function getInfoString(cmd) {
  var s = "reply: " + cmd.reply + "\ndelmsg: " + cmd.delmsg
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
	var now = new Date();
	var s = now.getSeconds();
	var min = now.getMinutes();
	var h = now.getHours();
	return (h < 10 ? "0"+h : h) + ":" + (min < 10 ? "0"+min : min) + ":" + (s < 10 ? "0"+s : s)
}

function getDateString() {
	var now = new Date();
	var d = now.getDate();
	var m = now.getMonth() +1;
	var y = now.getFullYear();
	return y + "/" + (m < 10 ? "0"+m : m) + "/" + (d < 10 ? "0"+d : d)
}

function substDollar(r, name, args, msg, nospecial) {
	var a = r.split("")
	for(var i = 0; i < a.length; i++) {
			var i0 = i
			if(a[i] != "$") continue
			if(a[i+1] == "$") { a.splice(i, 1, ""); i++; continue }
			var n = ""
			var v = ""
			i++
			if(!nospecial && a[i] == "*") {v = args.join(" "); n = "*"; i++}
			else if(!nospecial && a[i] == "u") {v = msg.author.tag; n = "u"; i++}
			else if(!nospecial && a[i] == "m") {v = "<@" + msg.author.id + ">"; n = "m"; i++}
			else if(!nospecial && a[i] == "d") {v = getDateString(); n = "d"; i++}
			else if(!nospecial && a[i] == "t") {v = getTimeString(); n = "t"; i++}
      else if(!nospecial && a[i] == "n") {v = "\n"; n = "n"; i++}
			else {
					while(!isNaN(a[i]) && a[i].trim() != "") {console.log(a[i], n, i);n += a[i]; i++}
			}
		if(!v && n) {
      v = (n == 0 ? name : args[n-1]) || ""
    }
		a.splice(i0, n.length+1, v)
		i=i0
	}
	return a.join("")
}
