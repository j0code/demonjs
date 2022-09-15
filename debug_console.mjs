import { client, config, special_ids, stalk, usermanager } from "./main.mjs"

process.stdin.on('readable', () => {
	let chunk
	while ((chunk = process.stdin.read()) != null) {
		try {
			var r = eval(chunk)
		} catch (error) {
			console.error(error)
			process.stdout.write("< ")
			console.dir(undefined)
			continue
		}
		process.stdout.write("< ")
		console.dir(r, {depth: 0})
	}
})

process.stdin.on('end', () => {
  process.stdout.write('end')
})

process.stdin.setEncoding('utf8')

function user(id) {
	if (!isNaN(id)) return client.users.cache.get(id)
	return client.users.cache.find(user => user.username == id)
}

function guild(id) {
	if (!isNaN(id)) return client.guilds.cache.get(id)
	return client.guilds.cache.find(guild => guild.name == id)
}

function member(gid, id) {
	const g = guild(gid)
	if (!g) return
	if (!isNaN(id)) return g.members.cache.get(id)
	return g.members.cache.find(user => user.displayName == id)
}

function channel(id) {
	if (!isNaN(id)) return client.channels.cache.get(id)
	return client.channels.cache.find(channel => channel.name == id)
}

function emoji(id) {
	if (!isNaN(id)) return client.emojis.cache.get(id)
	return client.emojis.cache.find(emoji => emoji.name == id)
}
