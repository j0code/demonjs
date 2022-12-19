import { Presence, PresenceStatus } from "discord.js"
import { EventEmitter } from "events"
import { client } from "../main.js"
import { compare } from "../util/util.js"

export default class StalkUser extends EventEmitter {

	static fromObject(o: any) {
		var stalkuser = new StalkUser(o.id, true)
		stalkuser.#active = o.active ?? false
		stalkuser.#lastSeen = o.lastSeen || Date.now()
		stalkuser.#status = o.status || undefined
		stalkuser.#deviceStatus = o.deviceStatus || {desktop: false, mobile: false, web: false}
		stalkuser.#justLeft = o.justLeft ?? false
		return stalkuser
	}

	static get activeTimeout() {
		return 3 * 60 * 1000 // 3 minutes
	}

	#id: string
	#active: boolean
	#lastSeen: number
	#status: PresenceStatus | undefined
	#deviceStatus: { desktop: boolean, mobile: boolean, web: boolean }
	#justLeft: boolean

	constructor(id: string, nocheck: boolean = false) {
		super()
		this.#id = id
		this.#active = false
		this.#lastSeen = Date.now()
		this.#status = undefined
		this.#deviceStatus = {desktop: false, mobile: false, web: false}
		this.#justLeft = false

		if(!nocheck && !this.#id) {
			console.error("StalkUser: Where ID?", this.#id)
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
		console.trace("Deprecated use of StalkUser.get user")
		return client.users.cache.get(this.#id)
	}

	async getUser() {
		let user = client.users.cache.get(this.#id) || client.users.fetch(this.#id)
		if(!user) {
			console.error("StalkUser: user not found", user, this.#id)
			if(!this.#id) process.kill(0)
		}
		return user
	}

	set presence(presence: Presence | undefined | null) {
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
