import { client } from "../main.mjs"
import * as save from "../save.mjs"
import MagicMap from "../util/magicmap.mjs"

var saveData = await save.load("embeds", true) || await save.load("backup/embeds", true) || {}

let embeds

export default class EmbedCmd {

	constructor() {
		save.write("backup/embeds", saveData)

		embeds = MagicMap.fromObject(saveData.embeds, {fromObject: o => {
			return { embeds: MagicMap.fromObject(o.embeds)}
		}})

		console.log("embeds:", ...embeds.conarr)

		client.on("interactionCreate", i => {
			if(i.type == "APPLICATION_COMMAND" && i.commandName == "embed") {
				let group = i.options._group
				let subcmd = i.options._subcommand

				if(group == "send") {

					if(subcmd == "new") {
						let o = getEmbedOptions(i)
						i.reply({content: o.content, embeds: [o.embed]})
						.catch(e => {
							i.reply({content: e.message, ephemeral: true})
						})
						return
					}

				} else if(subcmd == "create") {

					let o = getEmbedOptions(i)
					let id = i.options.getString("id")
					let user = embeds.get(i.user.id) || {embeds: new MagicMap()}
					if(user.embeds.has(id)) return i.reply({content: `An embed with the id ${id} already exists.\nTry/embed edit or /embed list`, ephemeral: true})
					i.reply({content: o.content, embeds: [o.embed], ephemeral: true})
					.then(() => {
						let user = embeds.get(i.user.id) || {embeds: new MagicMap()}
						user.embeds.set(id, o)
						console.log(id, o)
						embeds.set(i.user.id, user)
						writeSave()
					})
					.catch(e => {
						i.reply({content: e.message, ephemeral: true})
					})
					return

				} else if(subcmd == "view") {

					let id = i.options.getString("id")
					let user = embeds.get(i.user.id) || {embeds: new MagicMap()}
					let o = user.embeds.get(id)
					if(o) {
						i.reply({content: o.content, embeds: [o.embed], ephemeral: true})
						.catch(e => {
							i.reply({content: e.message, ephemeral: true})
						})
					} else {
						i.reply({content: "You did not create an embed with that id.\nTry /embed list", ephemeral: true})
					}
					return

				} else if(subcmd == "list") {

					let user = embeds.get(i.user.id) || {embeds: new MagicMap()}
					let ids = []
					for(let id of user.embeds.keys()) {
						ids.push(id)
					}
					if(ids) i.reply({content: `Embeds: ${ids.join(", ")}`, ephemeral: true})
					else if(ids) i.reply({content: "You did not create any embeds yet.\nTry /embed create", ephemeral: true})
					return

				}

				i.reply({content: "Error: Not yet implemented.", ephemeral: true})
			}
		})
	}

}

function getEmbedOptions(i) {
	let o = {}
	const keys = ["title","description","url","color","fields"]
	for(let k of keys) o[k] = i.options.getString(k)
	if(o.color && o.color.includes(",")) {
		o.color = o.color.replaceAll(" ", "").split(",")
		o.color = [Number(o.color[0]), Number(o.color[1]), Number(o.color[2])]
	}
	if(o.fields) {
		let fields = o.fields.split(";")
		o.fields = []
		for(let f of fields) {
			f = f.split(",")
			o.fields.push({name: f[0], value: f[1], inline: Boolean(f[2])})
		}
	}
	o.author = {name: i.options.getString("author"), url: i.options.getString("author-url"), iconURL: i.options.getString("author-icon")}
	o.footer = {text: i.options.getString("footer"), iconURL: i.options.getString("footer-icon")}
	o.image  = {url: i.options.getString("image")}
	o.video  = {url: i.options.getString("video")}
	return { embed: o, content: i.options.getString("content") }
}

function writeSave() {
	save.write("embeds", {embeds})
}
