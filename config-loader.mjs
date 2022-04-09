import fs from "fs/promises"

try {
	var data = await fs.readFile("config.json", { encoding: "utf-8" })
	data = JSON.parse(data)
} catch(e) {
	console.error(e)
}

export default data
