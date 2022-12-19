import { AutocompleteInteraction, ChatInputCommandInteraction, Interaction, PermissionsBitField } from "discord.js"
import { client } from "../main.js"
import * as save from "../save.js"
import { EmbedColorName, EmbedOptions, EMBED_COLORS } from "../apitypes.js"
import MagicMap from "../util/magicmap.js"
import { autocomplete } from "../util/util.js"

var saveData = await save.load("embeds", true) || await save.load("backup/embeds", true) || {}

export type EmbedSave = {
	content: string,
	embed: EmbedOptions
}

let embeds: MagicMap<MagicMap<EmbedSave>>

export default class EmbedCmd {

	constructor() {
		save.write("backup/embeds", saveData)

		embeds = MagicMap.fromObject(saveData.embeds, {
			fromObject: (o: any) => MagicMap.fromObject(o, null)
		})

		console.log("embeds:", ...embeds.conarr)

		client.on("interactionCreate", async (i: Interaction): Promise<void> => {
			if (!i) return
			if(i instanceof ChatInputCommandInteraction && i.commandName == "embed") {
				let group = i.options.getSubcommandGroup()
				let subcmd = i.options.getSubcommand()

				if(group == "send") {

					let authorized = false
					if(["DM","GROUP_DM"].includes(i.channel?.type || "")) authorized = true
					else {
						let perms = i.member.permissions
						authorized = perms.any([PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.ManageGuild], true)
					}
					if(!authorized) {
						i.reply({content: `Only server admins / mods may use this command.`, ephemeral: true})
						return
					}

					if(subcmd == "new") {

						let o = getEmbedOptions(i)
						i.reply({content: o.content, embeds: [convertEmbedOptions(o.embed)]})
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

						i.reply({content: o.content, embeds: [convertEmbedOptions(o.embed)]})
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
						if(!fields[index]) {
							i.reply({content: `There is no such field with index ${index} in ${id}.\nTry /embed view or /embed add`, ephemeral: true})
							return
						}
						fields.splice(index, 1)
					} else if(subcmd == "edit") {
						if(!fields[index]) {
							i.reply({content: `There is no such field with index ${index} in ${id}.\nTry /embed view or /embed add`, ephemeral: true})
							return
						}
						if(name   != null) fields[index].name   = name
						if(value  != null) fields[index].value  = value
						if(inline != null) fields[index].inline = inline
					}

					o.embed.fields = fields
					userEmbeds.set(id, o)
					embeds.set(i.user.id, userEmbeds)

					i.reply({content: o.content, embeds: [convertEmbedOptions(o.embed)], ephemeral: true})
					.catch(e => {
						i.reply({content: e.message, ephemeral: true})
					})

					writeSave()
					return

				} else if(subcmd == "create") {

					let o = getEmbedOptions(i)
					let id = i.options.getString("id") || ""
					let userEmbeds = embeds.get(i.user.id) || new MagicMap()
					if (embeds.has(id)) {
						i.reply({content: `An embed with the id ${id} already exists.\nTry /embed edit or /embed list`, ephemeral: true})
						return 
					}
					i.reply({content: o.content, embeds: [convertEmbedOptions(o.embed)], ephemeral: true})
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
						i.reply({content: o.content, embeds: [convertEmbedOptions(o.embed)], ephemeral: true})
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
					if(!userEmbeds.has(id)) {
						i.reply({content: `You did not create an embed with id ${id}.\nTry /embed list or /embed create`, ephemeral: true})
						return
					}
					let o = getEmbedOptions(i, userEmbeds.get(id))

					i.reply({content: o.content, embeds: [convertEmbedOptions(o.embed)], ephemeral: true})
					.catch(e => {
						i.reply({content: e.message, ephemeral: true})
					})

					writeSave()
					return

				} else if(subcmd == "delete") {

					let id = i.options.getString("id") || ""
					let userEmbeds = embeds.get(i.user.id) || new MagicMap()
					if(!userEmbeds.has(id)) {
						i.reply({content: `You did not create an embed with id ${id}.\nTry /embed list or /embed create`, ephemeral: true})
						return
					}
					let confirm = i.options.getString("confirmation")
					if(confirm != "I am sure") {
						i.reply({content: `In order to delete the embed, you have to confirm it.\nRemember that this **can not be undone.**\nIf you just want to edit the embed, use /embed edit or /embed field instead.`, ephemeral: true})
						return
					}

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
							(k,v) => k.includes(opt.value as string),
							(k,v) => ({name: `${k} (${v.embed?.title || v.embed?.description || console.log(`Invalid embed:`, v)})`, value: k})
						))

					}

				}
			}
		})
	}

}

function getEmbedOptions(i: ChatInputCommandInteraction, x?: EmbedSave): EmbedSave {
	let o: EmbedOptions = x?.embed || {}
	x = { embed: o, content: i.options.getString("content") ?? x?.content ?? "" }

	o.title       = i.options.getString("title") ?? o.title
	o.description = i.options.getString("description") ?? o.description
	o.url         = i.options.getString("url") ?? o.url
	let rawcolor  = i.options.getString("color")
	let rawfields = i.options.getString("fields")

	if (rawcolor) {
		if (rawcolor.includes(",")) { // r,g,b
			let carr = rawcolor.replaceAll(" ", "").split(",")
			if (carr.length == 3 && !isNaN(Number(carr[0])) && !isNaN(Number(carr[1])) && !isNaN(Number(carr[2]))) {
				o.color = [Number(carr[0]), Number(carr[1]), Number(carr[2])]
			}
		} else if (!isNaN(Number(rawcolor))) o.color = Number(rawcolor)
		else if (rawcolor in EmbedColorName) o.color = rawcolor as EmbedColorName

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
	o.author.name     = i.options.getString("author")      ?? o.author.name
	o.author.url      = i.options.getString("author-url")  ?? o.author.url
	o.author.icon_url = i.options.getString("author-icon") ?? o.author.icon_url
	o.footer.text     = i.options.getString("footer")      ?? o.footer.text
	o.footer.icon_url = i.options.getString("footer-icon") ?? o.footer.icon_url
	o.image.url       = i.options.getString("image")       ?? o.image.url
	o.video.url       = i.options.getString("video")       ?? o.video.url
	return x
}

function convertEmbedOptions(opt: EmbedOptions): EmbedOptions {
	let apiOpt: EmbedOptions = new Object(opt)
	if (apiOpt.color instanceof Array) {
		apiOpt.color = (apiOpt.color[0] << 16) + (apiOpt.color[1] << 8) + (apiOpt.color[2]) // [r,g,b] -> int
	} else if (apiOpt.color && apiOpt.color in EmbedColorName) {
		if (apiOpt.color == "RANDOM") apiOpt.color = Math.floor(Math.random() * 0x1000000) // int in [0, 0xffffff]
		else apiOpt.color = EMBED_COLORS.get(apiOpt.color as EmbedColorName)
	}
	console.log(opt, apiOpt)
	return apiOpt
}

function writeSave() {
	save.write("embeds", {embeds})
}
