import { stalk } from "./main.mjs"
import { camelToUpper } from "./util/util.mjs"

export function getLogTimeString() {
	var now = new Date();
	var s = now.getSeconds();
	var min = now.getMinutes();
	var h = now.getHours();
	var d = now.getDate();
	var m = now.getMonth() +1;
	var y = now.getFullYear();
	return y + "/" + (m < 10 ? "0"+m : m) + "/" + (d < 10 ? "0"+d : d) + " " + (h < 10 ? "0"+h : h) + ":" + (min < 10 ? "0"+min : min) + ":" + (s < 10 ? "0"+s : s)
}

export function logEvent(o, ...content) {
	var e = camelToUpper(o.e || "")
	var esc = "\u001B"
	console.log(`${esc}[90m${getLogTimeString()}${esc}[37m ${o.emoji || "  "} ${esc}[${o.color || "0"}m${e}${esc}[0;37m`, ...content)
}

export function logStalkEvents() {
	//stalk.on("witness", (e, user) => logEvent({ e: "witness", emoji: "🕵️ ", color: "90" }, user.user?.tag + ": " + e))
	//stalk.on("statusUpdate", (user, status, deviceStatus) => logEvent("statusUpdate", "🕵️ ", user.user?.tag, status, deviceStatus))
	stalk.on("active", (user) => {
		console.log("active", user, user.user)
		logEvent({ e: "active", emoji: "🕵️ ", color: "90" }, `${user.user.tag}`)
	})
	stalk.on("inactive", (user) => logEvent({ e: "inactive", emoji: "🕵️ ", color: "90" }, `${user.user.tag}`))
}
