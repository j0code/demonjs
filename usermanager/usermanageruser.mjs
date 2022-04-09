import { EventEmitter } from "events"
import { client } from "../main.mjs"
import { compare } from "../util/util.mjs"
import MagicMap from "../util/magicmap.mjs"

export default class UserManagerUser extends EventEmitter {

	#id; #guildSettings
	constructor(user) {
		super()
		this.#id = user.id
		this.#guildSettings = new MagicMap()
	}

	get id() {
		return this.#id
	}

	get user() {
		return client.users.cache.get(this.id)
	}

	updateGuildSettings(member) {
		var before = this.getGuildSettings(member.guild.id)
		var now = { nick: member.displayName }
		if(!compare(before, now)) {
			this.#guildSettings.set(member.guild.id, now)
			//emit()
		}
	}

	getGuildSettings(guildid) {
		return this.#guildSettings.get(guildid)
	}

	getMember(guildid) {
		return client.guilds.cache.get(guildid)?.members.cache.get(this.id)
	}

}
