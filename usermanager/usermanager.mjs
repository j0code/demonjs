import { EventEmitter } from "events"
import { client } from "../main.mjs"
import MagicMap from "../util/magicmap.mjs"
import UserManagerUser from "./usermanageruser.mjs"

const users = new MagicMap()

export default class UserManager {

	constructor() {

		client.on("guildMemberUpdate", (a, b) => {
			if(a.nickname != b.nickname) {
				var user
				if(users.has(a.id)) {
					user = users.get(a.id)
				} else {
					user = new UserManagerUser(b.user)
					users.set(a.id, user)
				}
				user.updateGuildSettings(b)
			}
		})

	}

	getUser(id) {
		return users.get(id)
	}

}
