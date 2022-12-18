import { ApplicationCommandOptionChoiceData } from "discord.js"
import MagicMap from "./magicmap.js"

export function compare(a: any, b: any) {
	if(a === b) return true
	if([a, b].includes(null)) return false
	if(typeof a != "object" || typeof b != "object" || !compareArray(Object.keys(a), Object.keys(b))) return false
	for(var key in a) {
		if(a[key] !== b[key]) return false
	}
	return true
}

function compareArray(a: any[], b: any[]) {
	if(a.length != b.length) return false
	for(var i in a) {
		if(a[i] !== b[i]) return false
	}
	return true
}

export function checkAny(s: any, arr: any[], func: string) {
	let f: any = s[func]
	if (!(f instanceof Function)) return
	for(let i = 0; i < arr.length; i++) {
		if (f(arr[i])) return i
	}
	return null
}

export function checkAll(s: any, arr: any[], func: string) { // use with !checkAll()
	let f: any = s[func]
	if (!(f instanceof Function)) return
	for(let i = 0; i < arr.length; i++) {
		if(!f(arr[i])) return i
	}
	return null
}

export function camelToUpper(s: string, dlm = "_") {
	let matches = s.matchAll(/[A-Z]/g)
	let chars = s.split("")
	for (let match of matches) if (match.index && match.index > 0) chars[match.index] = dlm + s[match.index]
	return chars.join("").trim().toUpperCase()
}

export function autocomplete<T>(list: MagicMap<T>, condition: (arg0: string, arg1: T) => boolean, choice: (arg0: string, arg1: T) => ApplicationCommandOptionChoiceData, max: number = 25) {
	let arr = []
	for (let e of list.entries()) {
		if (condition(e[0], e[1])) {
			let c = choice(e[0], e[1])
			if (c.name.length > 100 || String(c.value).length > 100) continue // no results with length >100 allowed
			arr.push(c)
		}
		if (arr.length >= 25 || arr.length >= max) break
	}
	return arr
}
