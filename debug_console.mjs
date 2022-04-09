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
