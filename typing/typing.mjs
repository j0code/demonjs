import { client } from "../main.mjs"

const pocTime = 30000 // 30s
const typingTime = 8000 // 8s
const typingUsers = new Map()

export function listen() {

	client.on("typingStart", typing => {
		//console.log("bef", typingUsers)
		var now = Date.now()
		var channels = getTypingChannels(typing.user.id)
		var o = setTypingChannel(channels, typing.channel.id)
		o.last = now
		//typing.channel.send(`${typing.user.tag} has been typing for ${(now - o.begin)/1000}s`)
		//console.log("aft", typingUsers)
	})

	client.on("messageCreate", msg => {
		var now = Date.now()
		var channels = getTypingChannels(msg.author.id)
		if(channels.has(msg.channel.id)) {
			var o = channels.get(msg.channel.id)
			channels.delete(msg.channel.id)
			if(now - o.begin > pocTime) {
				msg.channel.send(`${msg.author} pocced after ${(now - o.begin)/1000}s and ${o.pocs} pocs.`)
			}
			if (o.msg) {
				o.msg.delete()
				.catch(e => console.error("[Typing/ERROR]: Could not delete poc msg:", e))
			}
		}
	})

}

export function update() {
	var now = Date.now()

	for(let uid of typingUsers.keys()) {
		var channels = typingUsers.get(uid)
		if(!channels) continue
		for(let cid of channels.keys()) {
			var o = channels.get(cid)
			var c = client.channels.cache.get(cid)
			if(!c) continue
			if(now - o.last > typingTime) {
				var user = client.users.cache.get(uid)
				//if(user) c.send(`${user.tag} stopped typing after ${(now - o.begin)/1000}s`)
				channels.delete(cid)
				if (o.msg) {
					o.msg.delete()
					.catch(e => console.error("[Typing/ERROR]: Could not delete poc msg:", e))
				}
			} else if(now - o.begin > pocTime) {
				o.pocs++
				if (!o.msg) {
					c.send("poc").then(m => o.msg = m)
					.catch(e => console.error("[Typing/ERROR]: Could not send poc msg:", e))
				} else {
					o.msg.edit(`poc (${o.pocs})`).then(m => o.msg = m)
					.catch(e => console.error("[Typing/ERROR]: Could not edit poc msg:", e))
				}
			}
			//console.log(o, now - o.last, now - o.begin)
		}
	}
}


function getTypingChannels(id) {
	var channels
	if(!typingUsers.has(id)) {
		channels = new Map()
		typingUsers.set(id, channels)
	} else {
		channels = typingUsers.get(id)
	}
	return channels
}

function getTypingChannel(id) {
	if(!channels.has(id)) {
		channels.set(id, {})
	} else {
		startTime = channels.get(typing.channel.id)
	}
}

function setTypingChannel(channels, id) {
	//console.log(channels)
	var now = Date.now()
	var o
	if(!channels.has(id)) {
		//console.log("no")
		o = { begin: now, last: now, msg: null, pocs: 0 }
		channels.set(id, o)
	} else {
		//console.log("ye")
		o = channels.get(id)
	}
	return o
}
