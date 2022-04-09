export default class MagicMap extends Map {

	static fromObject(o, staticClass) {
		var map = new MagicMap()
		for(var key in o) {
			if(staticClass) {
				if(typeof staticClass.fromObject == "function")
					map.set(key, staticClass.fromObject(o[key]))
				else map.set(key, new staticClass(o[key]))
			} else map.set(key, o[key])
		}
		return map
	}

	toJSON() {
		var o = {}
		for(var key of this.keys()) {
			var value = this.get(key)
			if(typeof value.toJSON == "function") {
				o[key] = value.toJSON()
			} else o[key] = value
		}
		return o
	}

	toString() {
		return `MagicMap(${this.size})`
	}

	get conarr() {
		return [this+"", this.toJSON()]
	}

}
