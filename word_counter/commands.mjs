const appCommands = [{
  name: "wordcount",
  description: "show word counts",
	type: 1,
  options: [{
    type: 6,
    name: "user",
		description: "user",
		optional: true
  }, {
    type: 3,
    name: "word",
		description: "word",
		optional: true
  }]
}, {
  name: "words",
  description: "get word list (json)",
	type: 1,
  options: [{
    type: 6,
    name: "user",
		description: "user",
		optional: false
  }]
}]

export default appCommands
