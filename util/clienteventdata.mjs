import { events } from "./clientevents.mjs"
import { compare } from "./util.mjs"

export default class ClientEventData {

	#channel; #emoji; #guild; #member; #user; #message; #reaction; #client; #role; #stageInstance
	constructor(e, a, b, c) {
		this.e = e
		if(a) this.a = a
		if(b) this.b = b
		if(c) this.c = c

		if(events.API.includes(e)) {
			this.request = a
			this.response = b
		} else if(events.CHANNEL.includes(e)) {
			this.#channel = a || b
			if(e == "channelPinsUpdate") this.time = b
		} else if(events.DEBUG.includes(e)) this.info = a
		else if(events.EMOJI.includes(e)) {
			this.#emoji = a || b
		} else if(events.GUILD_BAN.includes(e)) data.ban = a
		else if(events.GUILD.includes(e) || e == "guildIntegrationsUpdate") {
			this.#guild = a
		} else if(events.GUILD_MEMBER.includes(e)) {
			if(e == "guildMembersChunk") {
				this.members = a
				this.#guild = b
				this.chunk = c
			} else this.#member = a || b
		} else if(events.GUILD_SCHEDULED_EVENT_ALL.includes(e)) {
			this.scheduledEvent = a
			if(event.GUILD_SCHEDULED_EVENT_USER.includes(e)) this.#user = b
		} else if(events.INTERACTION.includes(e)) this.interaction = a
		else if(e == "invalidRequestWarning") this.invalidRequestWarningData = a
		else if(events.INVITE.includes(e)) this.invite = a
		else if(events.MESSAGE.includes(e)) {
			if(e == "messageDeleteBulk") this.messages = a
			else this.#message = a || b
		} else if(events.MESSAGE_REACTION.includes(e)) {
			if(e == "messageReactionRemoveAll") {
				this.#message = a
				this.reactions = b
			} else {
				this.#reaction = a
				this.#user = b
			}
		} else if(events.PRESENCE.includes(e)) {
			this.presence = a || b
		} else if(e == "rateLimit") this.rateLimitData = a
		else if(e == "ready") this.#client = a
		else if(events.ROLE.includes(e)) {
			this.#role = a || b
		} else if(events.SHARD.includes(e)) {
			if(["shardReconnecting","shardReady"].includes(e)) {
				this.shardId = b
				this.info = a
			} else {
				this.shardId = a
				this.info = b
			}
		} else if(events.STAGE_INSTANCE.includes(e)) {
			this.#stageInstance = a || b
		} else if(events.STICKER.includes(e)) {
			this.sticker = a || b
		} else if(events.THREAD.includes(e)) {
			this.thread = a || b
		} else if(events.THREAD_LIST.includes(e)) {
			this.threads = a
		} else if(events.THREAD_MEMBERS.includes(e)) {
			this.members = a || b
		} else if(events.THREAD_MEMBER.includes(e)) {
			this.#member = a || b
		} else if(events.TYPING.includes(e)) {
			this.typing = a
		} else if(events.USER.includes(e)) {
			this.#user = a || b
		} else if(events.VOICE_STATE.includes(e)) {
			this.voiceState = a || b
		} else if(events.WEBHOOK.includes(e)) {
			this.#channel = a
		} else {
			console.error("ClientEvents Error: unknown event:", e, a, b, c)
		}

		if(events.groups.UPDATE.includes(e)) {
			this.before = a,
			this.now = b
		}
	}

	get channel() {
		return this.#channel || this.scheduledEvent?.channel || this.interaction?.channel || this.invite?.channel || this.message?.channel || this.stageInstance?.channel || this.thread?.parent || this.typing?.channel || this.voiceState?.channel || this.user?.dmChannel
	}

	get emoji() {
		return this.#emoji || this.reaction?.emoji
	}

	get guild() {
		return this.#guild || this.channel?.guild || this.emoji?.guild || this.ban?.guild || this.scheduledEvent?.guild || this.interaction?.guild || this.invite?.guild || this.message?.guild || this.role?.guild || this.presence?.guild || this.stageInstance?.guild || this.sticker?.guild || this.thread?.guild || this.typing?.guild || this.member?.guild || this.voiceState?.guild
	}

	get member() {
		return this.#member || this.interaction?.member || this.message?.member || this.presence?.member || this.typing?.member || this.voiceState?.member
	}

	get user() {
		return this.#user || this.ban?.user || this.interaction?.user || this.presence?.user || this.typing?.user || this.member?.user || this.author
	}

	get message() {
		return this.#message || this.reaction?.message
	}

	get reaction() {
		return this.#reaction
	}

	get client() {
		return this.#client || this.a?.client || this.b?.client || this.c?.client
	}

	get role() {
		return this.#role
	}

	get stageInstance() {
		return this.#stageInstance || this.invite?.stageInstance
	}

	get partial() {
		return this.a?.partial || this.b?.partial || this.c?.partial
	}

	get author() {
		return this.emoji?.author || this.scheduledEvent?.creator || this.invite?.inviter || this.message?.author
	}

	get changes() {
		if(!this.before && !this.now) return undefined
		var keys = []
		if(this.before) for(let k in this.before) if(!keys.includes(k)) keys.push(k)
		if(this.now)  for(let k in this.now)  if(!keys.includes(k)) keys.push(k)
		var changes = {}
		var conarr = ["{"]
		for(let k of keys) {
			if(!this.before || !this.now || !compare(this.before[k], this.now[k])) {
				changes[k] = { before: this.before[k], now: this.now[k] }
				conarr.push("\n  " + k + ":")
				conarr.push(this.before[k])
				conarr.push("->")
				conarr.push(this.now[k])
			}
		}
		if(conarr.length > 1) conarr.push("\n}")
		else conarr.push("}")
		changes.conarr = conarr
		return changes
	}

	toJSON() {
		var o = Object.fromEntries(Object.entries(this))
		if(this.channel)  o.channel  = this.channel
		if(this.emoji)    o.emoji    = this.emoji
		if(this.guild)    o.guild    = this.guild
		if(this.member)   o.member   = this.member
		if(this.user)     o.channel  = this.user
		if(this.message)  o.message  = this.message
		if(this.reaction) o.reaction = this.reaction
		if(this.client)   o.client   = this.client
		if(this.role)     o.role     = this.role
		if(this.stageInstance) o.stageInstance = this.stageInstance
		if(this.partial)  o.partial  = this.partial
		if(this.author)   o.author   = this.author
		if(this.changes)  o.changes  = this.changes
		return o
	}

	toString() {
		return "ClientEventData " + JSON.stringify(this, null, "  ")
	}

}
