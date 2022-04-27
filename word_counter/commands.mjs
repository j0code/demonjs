const appCommands = [{
  name: "wordcount",
  description: "show word counts",
	type: 1,
  options: [{
    type: 6,
    name: "user",
		description: "user",
		required: false
  }, {
    type: 3,
    name: "word",
		description: "word",
		required: false
  }, {
    type: 3,
    name: "language",
		description: "filter by language",
		required: false,
		autocomplete: true
  }]
}, {
  name: "words",
  description: "get word list (json)",
	type: 1,
	default_permission: false,
  options: [{
    type: 6,
    name: "user",
		description: "user",
		required: false
  }]
}, {
  name: "dictionary",
  description: "interact with the holy dictionary",
	type: 1,
  options: [{
    type: 1,
    name: "show",
		description: "show dictionary"
  }, {
    type: 1,
    name: "langs",
		description: "show languages"
  }, {
    type: 1,
    name: "addlang",
		description: "add language (bot owner only)",
	  options: [{
	    type: 3,
	    name: "code",
			description: "ISO 639-1 e.g. en, it, fr, de,...",
			required: true
	  }, {
	    type: 3,
	    name: "name",
			description: "lang name e.g. English, Italiano, Français, Deutsch,...",
			required: true
	  }, {
	    type: 3,
	    name: "name_en",
			description: "lang name in English e.g. English, Italia, French, German,...",
			required: true
	  }]
  }, {
    type: 2,
    name: "identify",
		description: "add language (bot owner only)",
	  options: [{
	    type: 1,
	    name: "random",
			description: "get a random word and select language"
	  }, {
	    type: 1,
	    name: "specific",
			description: "set language for specified word",
			options: [{
		    type: 3,
		    name: "word",
				description: "set language for specified word",
				required: true
		  }]
	  }]
  }]
}]

export default appCommands
