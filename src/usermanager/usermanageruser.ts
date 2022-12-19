import { EventEmitter } from "events"
import { client } from "../main.js"
import { compare } from "../util/util.js"
import MagicMap from "../util/magicmap.js"
import { GuildMember, User } from "discord.js";

export default class UserManagerUser extends EventEmitter {

	#id; #guildSettings
	constructor(user: User) {
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

	updateGuildSettings(member: GuildMember) {
		var before = this.getGuildSettings(member.guild.id)
		var now = { nick: member.displayName }
		if(!compare(before, now)) {
			this.#guildSettings.set(member.guild.id, now)
			//emit()
		}
	}

	getGuildSettings(guildid: string) {
		return this.#guildSettings.get(guildid)
	}

	getMember(guildid: string) {
		return client.guilds.cache.get(guildid)?.members.cache.get(this.id)
	}

}
