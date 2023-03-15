import { stalk } from "./main.js"
import { trailingFill } from "./util/util.js";

type LogLevel = {
	name: string,
	emoji: string,
	color?: string // ansi encape code w/o esc[ and m
}

export function getLogTimeString(date = new Date()) {
	var s = date.getSeconds();
	var min = date.getMinutes();
	var h = date.getHours();
	var d = date.getDate();
	var m = date.getMonth() +1;
	var y = date.getFullYear();
	return y + "-" + (m < 10 ? "0"+m : m) + "-" + (d < 10 ? "0"+d : d) + " " + (h < 10 ? "0"+h : h) + ":" + (min < 10 ? "0"+min : min) + ":" + (s < 10 ? "0"+s : s)
}

export function ansi(code: string | number) {
	return `${esc}[${code}m`
}

export function ansify(text: TemplateStringsArray, ...args: any[]) {
	let s = ""
	const codes = Object.values(AnsiCode)
	for (let i = 0; i < text.raw.length-1; i++) {
		let arg = args[i]
		if (codes.includes(arg)) arg = ansi(arg)
		s += text.raw[i] + arg
	}
	return s + text.raw[text.raw.length-1] + ansi(AnsiCode.reset)
}

export class Logger {

	readonly feature: string
	readonly featureColor: string // ansi encape code w/o esc[ and m

	constructor(feature: string, featureColor: string = "37") {
		this.feature = trailingFill(feature, 8)
		this.featureColor = featureColor
	}

	log(level: LogLevel, ...content: any[]) {
		let time = getLogTimeString()
		console.log(`${ansi(90)}${time} ${ansi(this.featureColor)}${this.feature}${ansi(37)} ${level.emoji || "  "} ${ansi(level.color || 0)}${level.name}${ansi("0;37")}`, ...content)
	}

}

export const AnsiCode = {
	reset:            "0",
	bold:             "1",
	underline:        "4",
	invert:           "7",
	not_bold:         "22",
	not_underline:    "24",
	not_invert:       "27",
	
	fg_black:         "30",
	fg_red:           "31",
	fg_green:         "32",
	fg_yellow:        "33",
	fg_blue:          "34",
	fg_magenta:       "35",
	fg_cyan:          "36",
	fg_light_grey:    "37",
	fg_extended:      "38",
	fg_reset:         "39",
	
	bg_black:         "40",
	bg_red:           "41",
	bg_green:         "42",
	bg_yellow:        "43",
	bg_blue:          "44",
	bg_magenta:       "45",
	bg_cyan:          "46",
	bg_light_grey:    "47",
	bg_extended:      "48",
	bg_reset:         "49",

	fg_dark_grey:     "90",
	fg_light_red:     "91",
	fg_light_green:   "92",
	fg_light_yellow:  "93",
	fg_light_blue:    "94",
	fg_light_magenta: "95",
	fg_light_cyan:    "96",
	fg_white:         "97",

	bg_dark_grey:     "100",
	bg_light_red:     "101",
	bg_light_green:   "102",
	bg_light_yellow:  "103",
	bg_light_blue:    "104",
	bg_light_magenta: "105",
	bg_light_cyan:    "106",
	bg_white:         "107"
} as const

const esc = "\u001B"
const stalkLogger = new Logger("Stalk", AnsiCode.fg_cyan)

/*export function logEvent(o: {e: string, emoji: string, color?: string | undefined}, ...content: any[]) {
	var e = camelToUpper(o.e || "")
	var esc = "\u001B"
	console.log(`${esc}[90m${getLogTimeString()}${esc}[37m ${o.emoji || "  "} ${esc}[${o.color || "0"}m${e}${esc}[0;37m`, ...content)
}*/

export function logStalkEvents() {
	//stalk.on("witness", (e, user) => logEvent({ e: "witness", emoji: "🕵️ ", color: "90" }, user.user?.tag + ": " + e))
	//stalk.on("statusUpdate", (user, status, deviceStatus) => logEvent("statusUpdate", "🕵️ ", user.user?.tag, status, deviceStatus))
	stalk.on("active", async (user) => {
		//console.log("active", user, user.user)
		let dcuser = await user.getUser()
		stalkLogger.log({ name: "active", emoji: "🕵️ ", color: "90" }, `${dcuser.tag}`)
	})
	stalk.on("inactive", async (user) => {
		let dcuser = await user.getUser()
		stalkLogger.log({ name: "inactive", emoji: "🕵️ ", color: "90" }, `${dcuser.tag}`)
	})
}