import fs from "fs/promises"

let data
try {
	data = await fs.readFile("./special_user_ids.json", {encoding: "utf8"})
	data = await JSON.parse(data)
} catch(e) {
	console.error(`Error loading special_user_ids:`, e)
	data = {}
}

export default data
