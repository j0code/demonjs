import { client } from "../main.js"
import ClientEventData from "./clienteventdata.js"

export const events: any = {
	API:                        ["apiRequest", "apiResponse"],
	DEBUG:                      ["debug", "error", "warn"],
	CHANNEL:                    ["channelCreate", "channelDelete", "channelPinsUpdate", "channelUpdate"],
	EMOJI:                      ["emojiCreate", "emojiDelete", "emojiUpdate"],
	GUILD_BAN:                  ["guildBanAdd", "guildBanRemove"],
	GUILD:                      ["guildCreate", "guildDelete", "guildUnavailable", "guildUpdate"],
	GUILD_INTEGRATIONS:         ["guildIntegrationsUpdate"],
	GUILD_MEMBER:               ["guildMemberAdd", "guildMemberAvailable", "guildMemberRemove", "guildMemberChunk", "guildMemberUpdate"],
	GUILD_MEMBER_ADD_REMOVE:    ["guildMemberAdd", "guildMemberRemove"],
	GUILD_SCHEDULED_EVENT:      ["guildScheduledEventCreate", "guildScheduledEventDelete", "guildScheduledEventUpdate"],
	GUILD_SCHEDULED_EVENT_USER: ["guildScheduledEventUserAdd", "guildScheduledEventUserRemove"],
	INTERACTION:                ["interactionCreate"],
	GATEWAY:                    ["invalidated", "invalidRequestWarning", "rateLimit", "ready"],
	INVITE:                     ["inviteCreate", "inviteDelete"],
	MESSAGE:                    ["messageCreate", "messageDelete", "messageDeleteBulk", "messageUpdate"],
	MESSAGE_REACTION:           ["messageReactionAdd", "messageReactionRemove", "messageReactionRemoveAll", "messageReactionRemoveEmoji"],
	PRESENCE:                   ["presenceUpdate"],
	ROLE:                       ["roleCreate", "roleDelete", "roleUpdate"],
	SHARD:                      ["shardDisconnect", "shardError", "shardReady", "shardReconnecting", "shardResume"],
	STAGE_INSTANCE:             ["stageInstanceCreate", "stageInstanceDelete", "stageInstanceUpdate"],
	STICKER:                    ["stickerCreate", "stickerDelete", "stickerUpdate"],
	THREAD:                     ["threadCreate", "threadDelete", "threadUpdate"],
	THREAD_LIST:                ["threadListSync"],
	THREAD_MEMBERS:             ["threadMembersUpdate"],
	THREAD_MEMBER:              ["threadMemberUpdate"],
	TYPING:                     ["typingStart"],
	USER:                       ["userUpdate"],
	VOICE_STATE:                ["voiceStateUpdate"],
	WEBHOOK:                    ["webhookUpdate"],

	groups: {
		CREATE: ["channelCreate", "emojiCreate", "guildCreate", "guildScheduledEventCreate", "interactionCreate", "inviteCreate", "messageCreate", "roleCreate", "stageInstanceCreate", "stickerCreate", "threadCreate"],
		DELETE: ["channelDelete", "emojiDelete", "guildDelete", "guildScheduledEventDelete", "inviteDelete", "messageDelete", "messageDeleteBulk", "roleDelete", "stageInstanceDelete", "stickerDelete"],
		UPDATE: ["channelPinsUpdate", "channelUpdate", "emojiUpdate", "guildUpdate", "guildIntegrationsUpdate", "guildMemberUpdate", "guildScheduledEventUpdate", "messageUpdate", "presenceUpdate", "roleUpdate", "stageInstanceUpdate", "stickerUpdate", "threadMembersUpdate", "threadMemberUpdate", "threadUpdate", "userUpdate"],
		ADD:    ["guildBanAdd", "guildMemberAdd", "guildScheduledEventUserAdd", "messageReactionAdd", "voiceStateUpdate", "webhookUpdate"],
		REMOVE: ["guildBanRemove", "guildMemberRemove", "guildScheduledEventUserRemove", "messageReactionRemove", "messageReactionRemoveAll", "messageReactionRemoveEmoji"]
	},

	gateway: {
		GUILDS:                    ["guildCreate", "guildUpdate", "guildDelete", "roleCreate", "roleUpdate", "roleDelete", "channelCreate", "channelUpdate", "channelDelete", "channelPinsUpdate", "threadCreate", "threadUpdate", "threadDelete", "threadListSync", "threadMemberUpdate", "threadMembersUpdate", "stageInstanceCreate", "stageInstanceUpdate", "stageInstanceDelete"],
		GUILD_MEMBERS:             ["guildMemberAdd", "guildMemberUpdate", "guildMemberRemove", "threadMembersUpdate"],
		GUILD_BANS:                ["guildBanAdd", "guildBanRemove"],
		GUILD_EMOJIS_AND_STICKERS: ["emojiUpdate", "stickerUpdate"],
		GUILD_INTEGRATIONS:        ["guildIntegrationsUpdate"],
		GUILD_WEBHOOKS:            ["webhookUpdate"],
		GUILD_INVITES:             ["inviteCreate", "inviteDelete"],
		GUILD_VOICE_STATES:        ["voiceStateUpdate"],
		GUILD_PRESENCES:           ["presenceUpdate"],
		GUILD_MESSAGES:            ["messageCreate", "messageUpdate", "messageDelete", "messageDeleteBulk"],
		GUILD_MESSAGE_REACTIONS:   ["messageReactionAdd", "messageReactionRemove", "messageReactionRemoveAll", "messageReactionRemoveEmoji"],
		GUILD_MESSAGE_TYPING:      ["typingStart"],
		DIRECT_MESSAGES:           ["messageCreate", "messageUpdate", "messageDelete", "channelPinsUpdate"],
		DIRECT_MESSAGE_REACTIONS:  ["messageReactionAdd", "messageReactionRemove", "messageReactionRemoveAll", "messageReactionRemoveEmoji"],
		DIRECT_MESSAGE_TYPING:     ["typingStart"],
		GUILD_SCHEDULED_EVENTS:    ["guildScheduledEventCreate", "guildScheduledEventUpdate", "guildScheduledEventDelete", "guildScheduledEventUserAdd", "guildScheduledEventUserRemove"]
	}
}

events.CHANNEL_ALL                = events.CHANNEL.concat(events.MESSAGE, events.THREAD)
events.GUILD_ALL                  = events.GUILD.concat(events.CHANNEL, events.EMOJI, events.GUILD_BAN, events.GUILD_INTEGRATIONS, events.GUILD_MEMBER, events.GUILD_SCHEDULED_EVENT, events.INVITE, events.MESSAGE, events.ROLE, events.STAGE_INSTANCE, events.STICKER, events.THREAD, events.VOICE_STATE)
events.GUILD_MEMBER_ALL           = events.GUILD_MEMBER.concat(events.PRESENCE, events.VOICE_STATE)
events.GUILD_SCHEDULED_EVENT_ALL  = events.GUILD_SCHEDULED_EVENT.concat(events.GUILD_SCHEDULED_EVENT_USER)
events.MESSAGE_ALL                = events.MESSAGE.concat(events.MESSAGE_REACTION)
events.THREAD_ALL                 = events.THREAD.concat(events.THREAD_LIST, events.THREAD_MEMBERS, events.THREAD_MEMBER)
events.USER_ALL                   = events.USER.concat(events.GUILD_MEMBER_ALL)
events.ANY                        = events.GUILD_ALL.concat(events.GUILD_SCHEDULED_EVENT_USER, events.INTERACTION, events.MESSAGE_REACTION, events.PRESENCE, events.THREAD_LIST, events.THREAD_MEMBERS, events.THREAD_MEMBER, events.TYPING, events.USER, events.WEBHOOK),
events.ALL                        = events.ANY.concat(events.API, events.DEBUG, events.GATEWAY, events.SHARD)

export function on(e: string[][] | string[] | string, callback: (data: ClientEventData) => void) {
	if (typeof e == "string") e = [e]
	let a: string[] = []
	e = a.concat(...e)
	//console.log("on", e)
	for(let i = 0; i < e.length; i++) {
		client.on(e[i], (a, b, c) => {
			let ename = e[i]
			if (typeof ename != "string") return
			let data = new ClientEventData(ename, a, b, c)
			callback(data)
		})
	}
}

export function onAny(callback: (data: ClientEventData) => void) {
	on(events.ANY, callback)
}
