export function compare(a, b) {
	if(a === b) return true
	if([a, b].includes(null)) return false
	if(typeof a != "object" || typeof b != "object" || !compareArray(Object.keys(a), Object.keys(b))) return false
	for(var key in a) {
		if(a[key] !== b[key]) return false
	}
	return true
}

function compareArray(a, b) {
	if(a.length != b.length) return false
	for(var i in a) {
		if(a[i] !== b[i]) return false
	}
	return true
}

export function checkAny(s, arr, func) {
	if(!s || !arr || !func || typeof s != "string" || !(arr instanceof Array) || typeof func != "string" || typeof s[func] != "function") return null
	for(let i = 0; i < arr.length; i++) {
		if(s[func](arr[i])) return i
	}
	return null
}

export function checkAll(s, arr, func) { // use with !checkAll()
	if(!s || !arr || !func || !(arr instanceof Array) || typeof func != "string" || typeof a[func] != "function") return null
	for(let i = 0; i < arr.length; i++) {
		if(!s[func](arr[i])) return i
	}
	return null
}

export function camelToUpper(s, dlm = "_") {
	var matches = s.matchAll(/[A-Z]/g)
	s = s.split("")
	for(var match of matches) if(match.index > 0) s[match.index] = dlm + s[match.index]
	return s.join("").trim().toUpperCase()
}
