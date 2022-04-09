import { client, stalk, usermanager } from "../main.mjs"
import { checkAny } from "../util/util.mjs"

const debugChannel = "943264045866291240"
const testServer = "859422707229917204"
const badges = {
	online: "🟢",
	idle: "🌙",
	dnd: "⛔",
	offline: "",
	invisible: "🕵",
	web: "🌐",
	mobile: "📱",
	desktop: "🖥"
}

export default class StatusBadger {

	constructor() {
		stalk.on("statusUpdate", (user, status, deviceStatus) => {
			// debug
			/*var c = client.channels.cache.get(debugChannel)
			if(!c) return console.error("StatusBadger: Error: debug channel missing or unavailable")
			c.send(`${user.user.tag} changed their status to ${status}.`)*/

			// apply badge
			var g = client.guilds.cache.get(testServer)
			if(!g) return console.error("StatusBadger: Error: test server missing or unavailable")
			var m = g.members.cache.get(user.id)
			if(m) this.updateNickname(m)
		})

		client.on("guildMemberUpdate", (a, b) => {
			if(a.displayName != b.displayName) {
				this.updateNickname(b)
			}
		})
	}

	getBadges(stalkuser) {
		stalkuser = stalkuser || stalk.getUser(stalkuser)
		if(!isNaN(stalkuser)) stalkuser = stalk.getUser(stalkuser)
		if(!stalkuser) return []
		//console.log(stalkuser, stalkuser.deviceStatus)
		var emojis = []
		if(stalkuser.status == "invisible") emojis.push(badges.invisible)
		if(stalkuser.deviceStatus.web) emojis.push(badges.web)
		if(stalkuser.deviceStatus.mobile) emojis.push(badges.mobile)
		if(stalkuser.deviceStatus.desktop) emojis.push(badges.desktop)
		return emojis
	}

	updateNickname(member) {
		if(!member || member.user.bot) return 
		var badgeList = [badges.desktop, badges.mobile, badges.web, badges.invisible] // in reverse since it cuts the from the end
		var nick = member.displayName
		var emojis = this.getBadges(member.id)
		if(!emojis) return
		var index = null
		while((index = checkAny(nick, badgeList, "endsWith")) != null) {
			//console.log("before:", {nick, index, badges: badgeList[index], len: badgeList[index].length})
			nick = nick.substr(0, nick.length - badgeList[index].length)
			//console.log("after: ", {nick})
		}
		nick = nick.trim()
		var combined = nick.substr(0, 32 - emojis.length - 1) + " " + emojis.join("") // must not exceed 32 chars
		if(combined != member.displayName) {
			if(combined.length > 32) combined = member.user.username.substr(0, 32 - emojis.length - 1) + " " + emojis.join("")
			member.setNickname(combined, "Apply Badges")
			.catch(e => console.error("StatusBadger: Error:", e))
		}
		//console.log({ before: member.displayName, nick, emojis, combined, beforeBuf: Buffer.from(member.displayName), nickBuffr: Buffer.from(nick), emojisBuf: Buffer.from(emojis.join(""))})
	}

}
