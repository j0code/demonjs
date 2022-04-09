const appCommands = [{
  name: "wordcount",
  description: "show word counts",
	type: 1,
  options: [{
    type: 6,
    name: "user",
		description: "user",
		optional: true
  }]
}]

export default appCommands
