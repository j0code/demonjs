export default class MagicMap<V> extends Map<string, V> {

	static fromObject<V>(o: any, staticClass?: any) {
		var map = new MagicMap<V>()
		for (let key in o) {
			if (staticClass) {
				if (typeof staticClass.fromObject == "function")
					map.set(key, staticClass.fromObject(o[key]))
				else map.set(key, new staticClass(o[key]))
			} else map.set(key, o[key])
		}
		return map
	}

	toJSON() {
		let o: any = {}
		for (let key of this.keys()) {
			let value: any = this.get(key)
			if (!value) continue
			if (typeof value.toJSON == "function") {
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
