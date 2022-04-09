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

	toObject() {
		var o = {}
		for(var key of this.keys()) {
			var value = this.get(key)
			if(typeof value.toObject == "function") {
				o[key] = value.toObject()
			} else o[key] = value
		}
		return o
	}

	toString() {
		return `MagicMap(${this.size})`
	}

	get conarr() {
		return [this+"", this.toObject()]
	}

}
