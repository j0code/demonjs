import { EventEmitter } from "events"
import { client } from "../main.mjs"
import { compare } from "../util/util.mjs"

export default class StalkUser extends EventEmitter {

	static fromObject(o) {
		var stalkuser = new StalkUser(undefined, true)
		stalkuser.#id = o.id
		stalkuser.#active = o.active
		stalkuser.#lastSeen = o.lastSeen
		stalkuser.#status = o.status
		stalkuser.#deviceStatus = o.deviceStatus
		stalkuser.#justLeft = o.justLeft
		if(!client.users.cache.has(o.id)) {
			client.users.fetch(o.id, { cache: true, force: true })
			.then(user => console.log("StalkUser: fetched", user.tag, user.hexAccentColor))
			.catch(e => console.error("StalkUser: Error fetching user:", e))
		}
		return stalkuser
	}

	static get activeTimeout() {
		return 3 * 60 * 1000 // 3 minutes
	}

	#id; #active; #lastSeen; #status; #deviceStatus; #justLeft;
	constructor(user, nocheck) {
		super()
		this.#id = user ? user.id : undefined
		this.#active = false
		this.#lastSeen = Date.now()
		this.#status = undefined
		this.#deviceStatus = {desktop: false, mobile: false, web: false}
		this.#justLeft = false

		if(!nocheck && !this.#id) {
			console.error("StalkUser: Where ID?", this.#id, user)
			process.kill(0)
		}
	}

	get id() {
		return this.#id
	}

	get active() {
		return Date.now() - this.#lastSeen < StalkUser.activeTimeout
	}

	get lastSeen() {
		return this.#lastSeen
	}

	get status() {
		if(this.#status == "offline" && this.active && !this.#justLeft) return "invisible"
		return this.#status
	}

	get deviceStatus() {
		return this.#deviceStatus
	}

	get user() {
		var user = client.users.cache.get(this.#id)
		if(!user) {
			console.error("StalkUser: user not found", user, this.#id)
			if(!this.#id) process.kill(0)
		}
		return client.users.cache.get(this.#id)
	}

	set presence(presence) {
		if(!presence) return
		var sB = this.status // statusBefore
		var dSB = this.#deviceStatus // deviceStatusBefore
		if(presence.status != this.#status && presence.status == "offline") this.#justLeft = true
		if(["offline","idle","dnd","online"].includes(presence.status)) this.#status = presence.status
		this.#deviceStatus.desktop = presence?.clientStatus?.desktop != undefined
		this.#deviceStatus.mobile = presence?.clientStatus?.mobile != undefined
		this.#deviceStatus.web = presence?.clientStatus?.web != undefined
		if(sB != this.status || !compare(dSB, this.#deviceStatus)) this.emit("statusUpdate", this.status, this.#deviceStatus)
		//console.log("statusUpdate! (presence)", undefined, sB, this.status, dSB, this.#deviceStatus, sB != this.status || !compare(dSB, this.#deviceStatus))
		this.emit("statusUpdate", this.status, this.#deviceStatus)
	}

	seen() {
		var statusBefore = this.status
		this.#justLeft = false
		this.#lastSeen = Date.now()
		this.emit("seen")
		if(this.#active != this.active) {
			this.#active = this.active
			if(this.active == true) this.emit("active")
			else this.emit("inactive")
		}
		if(statusBefore != this.status) this.emit("statusUpdate", this.status, this.#deviceStatus)
		//console.log("statusUpdate! (seen)", statusBefore != this.status)
	}

	update() {
		//console.log("suu", this.user.username, this.#active, this.active, Date.now() - this.#lastSeen, StalkUser.activeTimeout)
		if(this.#active != this.active) {
			this.#active = this.active
			if(this.active == true) this.emit("active")
			else this.emit("inactive")
		}
	}

	toJSON() {
		return { id: this.#id, active: this.#active, lastSeen: this.#lastSeen, status: this.#status, deviceStatus: this.#deviceStatus, justLeft: this.#justLeft }
	}

}
