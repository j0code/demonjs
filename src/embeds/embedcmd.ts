import { AutocompleteInteraction, ColorResolvable, CommandInteraction, MessageEmbedOptions, Permissions } from "discord.js"
import { client } from "../main.js"
import * as save from "../save.js"
import MagicMap from "../util/magicmap.js"
import { autocomplete } from "../util/util.js"

var saveData = await save.load("embeds", true) || await save.load("backup/embeds", true) || {}

export type EmbedSave = {
	content: string,
	embed: MessageEmbedOptions
}

let embeds: MagicMap<MagicMap<EmbedSave>>

export default class EmbedCmd {

	constructor() {
		save.write("backup/embeds", saveData)

		embeds = MagicMap.fromObject(saveData.embeds, {
			fromObject: (o: any) => MagicMap.fromObject(o, null)
		})

		console.log("embeds:", ...embeds.conarr)

		client.on("interactionCreate", async i => {
			if (!i) return
			if(i instanceof CommandInteraction && i.commandName == "embed") {
				let group = i.options.getSubcommand()
				let subcmd = i.options.getSubcommandGroup()

				if(group == "send") {

					let authorized = false
					if(["DM","GROUP_DM"].includes(i.channel?.type || "")) authorized = true
					else {
						let perms = i.member.permissions
						authorized = perms.any([Permissions.FLAGS.MODERATE_MEMBERS, Permissions.FLAGS.MANAGE_GUILD], true)
					}
					if(!authorized) return i.reply({content: `Only server admins / mods may use this command.`, ephemeral: true})

					if(subcmd == "new") {

						let o = getEmbedOptions(i)
						i.reply({content: o.content, embeds: [o.embed]})
						.catch(e => {
							i.reply({content: e.message, ephemeral: true})
						})
						return

					} else if(subcmd == "select") {

						let id = i.options.getString("id") || ""
						let userEmbeds = embeds.get(i.user.id) || new MagicMap()
						let o  = userEmbeds.get(id)

						if (!o) {
							i.reply({content: `Embed with ID "${id}" not found.\nTry /embed list or /embed create`, ephemeral: true})
							return
						}

						i.reply({content: o.content, embeds: [o.embed]})
						.catch(e => {
							i.reply({content: e.message, ephemeral: true})
						})

						return

					}

				} else if(group == "field") {

					let id = i.options.getString("id") || ""
					let userEmbeds = embeds.get(i.user.id) || new MagicMap()
					let o  = userEmbeds.get(id)

					if (!o) {
						i.reply({content: `Embed with ID "${id}" not found.\nTry /embed list or /embed create`, ephemeral: true})
						return
					}

					let fields = o.embed.fields || []
					let index  = i.options.getInteger("index") ?? fields.length
					let name   = i.options.getString("name")
					let value  = i.options.getString("value")
					let inline = i.options.getBoolean("inline")

					if(subcmd == "add") {
						if(name && value) {
							fields.splice(index, 0, {name, value, inline: inline || false})
						}
					} else if(subcmd == "remove") {
						console.log(index, fields)
						if(!fields[index]) return i.reply({content: `There is no such field with index ${index} in ${id}.\nTry /embed view or /embed add`, ephemeral: true})
						fields.splice(index, 1)
					} else if(subcmd == "edit") {
						if(!fields[index]) return i.reply({content: `There is no such field with index ${index} in ${id}.\nTry /embed view or /embed add`, ephemeral: true})
						if(name   != null) fields[index].name   = name
						if(value  != null) fields[index].value  = value
						if(inline != null) fields[index].inline = inline
					}

					o.embed.fields = fields
					userEmbeds.set(id, o)
					embeds.set(i.user.id, userEmbeds)

					i.reply({content: o.content, embeds: [o.embed], ephemeral: true})
					.catch(e => {
						i.reply({content: e.message, ephemeral: true})
					})

					writeSave()
					return

				} else if(subcmd == "create") {

					let o = getEmbedOptions(i)
					let id = i.options.getString("id") || ""
					let userEmbeds = embeds.get(i.user.id) || new MagicMap()
					if (embeds.has(id)) return i.reply({content: `An embed with the id ${id} already exists.\nTry /embed edit or /embed list`, ephemeral: true})
					i.reply({content: o.content, embeds: [o.embed], ephemeral: true})
					.then(() => {
						let userEmbeds = embeds.get(i.user.id) || new MagicMap()
						userEmbeds.set(id, o)
						console.log(id, o)
						embeds.set(i.user.id, userEmbeds)
						writeSave()
					})
					.catch(e => {
						i.reply({content: e.message, ephemeral: true})
					})
					return

				} else if(subcmd == "view") {

					let id = i.options.getString("id") || ""
					let userEmbeds = embeds.get(i.user.id) || new MagicMap()
					let o = userEmbeds.get(id)
					if(o) {
						i.reply({content: o.content, embeds: [o.embed], ephemeral: true})
						.catch(e => {
							i.reply({content: e.message, ephemeral: true})
						})
					} else {
						i.reply({content: `You did not create an embed with id ${id}.\nTry /embed list or /embed create`, ephemeral: true})
					}
					return

				} else if(subcmd == "list") {

					let userEmbeds = embeds.get(i.user.id) || new MagicMap()
					let ids = []
					for(let id of userEmbeds.keys()) {
						ids.push(id)
					}
					if(ids) i.reply({content: `Embeds: ${ids.join(", ")}`, ephemeral: true})
					else if(ids) i.reply({content: "You did not create any embeds yet.\nTry /embed create", ephemeral: true})
					return

				} else if(subcmd == "edit") {

					let id = i.options.getString("id") || ""
					let userEmbeds = embeds.get(i.user.id) || new MagicMap()
					if(!userEmbeds.has(id)) return i.reply({content: `You did not create an embed with id ${id}.\nTry /embed list or /embed create`, ephemeral: true})
					let o = getEmbedOptions(i, userEmbeds.get(id))

					i.reply({content: o.content, embeds: [o.embed], ephemeral: true})
					.catch(e => {
						i.reply({content: e.message, ephemeral: true})
					})

					writeSave()
					return

				} else if(subcmd == "delete") {

					let id = i.options.getString("id") || ""
					let userEmbeds = embeds.get(i.user.id) || new MagicMap()
					if(!userEmbeds.has(id)) return i.reply({content: `You did not create an embed with id ${id}.\nTry /embed list or /embed create`, ephemeral: true})
					let confirm = i.options.getString("confirmation")
					if(confirm != "I am sure") return i.reply({content: `In order to delete the embed, you have to confirm it.\nRemember that this **can not be undone.**\nIf you just want to edit the embed, use /embed edit or /embed field instead.`, ephemeral: true})

					userEmbeds.delete(id)

					i.reply({content: "Successfully deleted", ephemeral: true})

					writeSave()
					return

				}

				i.reply({content: "Error: Not yet implemented.", ephemeral: true})
			} else if (i instanceof AutocompleteInteraction) {
				if (i.commandName == "embed") {
					let opt = i.options.getFocused(true)

					if (opt.name == "id") {

						let userEmbeds = embeds.get(i.user.id) || new MagicMap()
						i.respond(autocomplete<EmbedSave>(userEmbeds,
							(k,v) => k.includes(opt.value),
							(k,v) => ({name: `${k} (${v.embed.title || v.embed.description || console.log(v)})`, value: k})
						))

					}

				}
			}
		})
	}

}

function getEmbedOptions(i: CommandInteraction, x?: EmbedSave): EmbedSave {
	let o: MessageEmbedOptions = x?.embed || {}
	x = { embed: o, content: i.options.getString("content") ?? x?.content ?? "" }

	o.title       = i.options.getString("title") ?? o.title
	o.description = i.options.getString("description") ?? o.description
	o.url         = i.options.getString("url") ?? o.url
	let rawcolor  = i.options.getString("color")
	let rawfields = i.options.getString("fields")

	if(rawcolor && rawcolor.includes(",")) { // r,g,b
		let carr = rawcolor.replaceAll(" ", "").split(",")
		o.color = [Number(carr[0]), Number(carr[1]), Number(carr[2])]
	}

	if(rawfields && typeof rawfields == "string") { // name0,value0,inline0;name1,value1,inline1;...
		let fields = rawfields.split(";")
		o.fields = []
		for(let f of fields) {
			let farr = f.split(",")
			o.fields.push({name: farr[0], value: farr[1], inline: Boolean(f[2])})
		}
	}

	if(!o.author) o.author = {}
	if(!o.footer) o.footer = {}
	if(!o.image)  o.image  = {}
	if(!o.video)  o.video  = {}
	o.author.name    = i.options.getString("author")      ?? o.author.name
	o.author.url     = i.options.getString("author-url")  ?? o.author.url
	o.author.iconURL = i.options.getString("author-icon") ?? o.author.iconURL
	o.footer.text    = i.options.getString("footer")      ?? o.footer.text
	o.footer.iconURL = i.options.getString("footer-icon") ?? o.footer.iconURL
	o.image.url      = i.options.getString("image")       ?? o.image.url
	o.video.url      = i.options.getString("video")       ?? o.video.url
	return x
}

function writeSave() {
	save.write("embeds", {embeds})
}
