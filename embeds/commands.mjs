const appCommands = [{
  name: "embed",
  description: "embed builder",
	type: 1,
  options: [{
    type: 2,
    name: "send",
		description: "send embed",
		options: [{
	    type: 1,
	    name: "new",
			description: "send new embed",
			options: [{
		    type: 3,
		    name: "title",
				description: "title",
				required: false
		  }, {
		    type: 3,
		    name: "description",
				description: "description",
				required: false
		  }, {
		    type: 3,
		    name: "url",
				description: "url of title",
				required: false
		  }, {
		    type: 3,
		    name: "color",
				description: "color (#hexval; r,g,b; or COLOR_NAME)",
				required: false
		  }, {
		    type: 3,
		    name: "fields",
				description: "fields (format: name1,value1,false;name2,value2,true)",
				required: false
		  }, {
		    type: 3,
		    name: "author",
				description: "author name",
				required: false
		  }, {
		    type: 3,
		    name: "author-url",
				description: "author url",
				required: false
		  }, {
		    type: 3,
		    name: "author-icon",
				description: "author icon url",
				required: false
		  }, {
		    type: 3,
		    name: "image",
				description: "image url",
				required: false
		  }, {
		    type: 3,
		    name: "video",
				description: "video url",
				required: false
		  }, {
		    type: 3,
		    name: "footer",
				description: "footer",
				required: false
		  }, {
		    type: 3,
		    name: "footer-icon",
				description: "footer icon url",
				required: false
		  }, {
		    type: 3,
		    name: "content",
				description: "regular message content (above embed)",
				required: false
		  }]
	  }, {
	    type: 1,
	    name: "select",
			description: "send saved embed",
			options: [{
				type: 3,
				name: "id",
				description: "embed id",
				required: true
			}]
	  }]
  }, {
		type: 1,
		name: "create",
		description: "create a new embed",
		options: [{
			type: 3,
			name: "id",
			description: "id to identify embed",
			required: true
		}, {
			type: 3,
			name: "title",
			description: "title",
			required: false
		}, {
			type: 3,
			name: "description",
			description: "description",
			required: false
		}, {
			type: 3,
			name: "url",
			description: "url of title",
			required: false
		}, {
			type: 3,
			name: "color",
			description: "color (#hexval; r,g,b; or COLOR_NAME)",
			required: false
		}, {
			type: 3,
			name: "fields",
			description: "fields (format: name1,value1,false;name2,value2,true)",
			required: false
		}, {
			type: 3,
			name: "author",
			description: "author name",
			required: false
		}, {
			type: 3,
			name: "author-url",
			description: "author url",
			required: false
		}, {
			type: 3,
			name: "author-icon",
			description: "author icon url",
			required: false
		}, {
			type: 3,
			name: "image",
			description: "image url",
			required: false
		}, {
			type: 3,
			name: "video",
			description: "video url",
			required: false
		}, {
			type: 3,
			name: "footer",
			description: "footer",
			required: false
		}, {
			type: 3,
			name: "footer-icon",
			description: "footer icon url",
			required: false
		}, {
			type: 3,
			name: "content",
			description: "regular message content (above embed)",
			required: false
		}]
	}, {
		type: 1,
		name: "view",
		description: "view saved embed",
		options: [{
			type: 3,
			name: "id",
			description: "embed id",
			required: true
		}]
	}, {
		type: 1,
		name: "list",
		description: "list saved embeds",
		options: []
	}, {
		type: 1,
		name: "edit",
		description: "edit saved embed",
		options: [{
			type: 3,
			name: "title",
			description: "title",
			required: false
		}, {
			type: 3,
			name: "description",
			description: "description",
			required: false
		}, {
			type: 3,
			name: "url",
			description: "url of title",
			required: false
		}, {
			type: 3,
			name: "color",
			description: "color (#hexval; r,g,b; or COLOR_NAME)",
			required: false
		}, {
			type: 3,
			name: "author",
			description: "author name",
			required: false
		}, {
			type: 3,
			name: "author-url",
			description: "author url",
			required: false
		}, {
			type: 3,
			name: "author-icon",
			description: "author icon url",
			required: false
		}, {
			type: 3,
			name: "image",
			description: "image url",
			required: false
		}, {
			type: 3,
			name: "video",
			description: "video url",
			required: false
		}, {
			type: 3,
			name: "footer",
			description: "footer",
			required: false
		}, {
			type: 3,
			name: "footer-icon",
			description: "footer icon url",
			required: false
		}, {
			type: 3,
			name: "content",
			description: "regular message content (above embed)",
			required: false
		}]
	}, {
		type: 2,
		name: "field",
		description: "modify embed fields",
		options: [{
			type: 1,
			name: "add",
			description: "add field",
			options: [{
				type: 3,
				name: "id",
				description: "embed id",
				required: true
			}, {
				type: 4,
				name: "index",
				description: "index in the fields array (default: end of array)",
				required: false
			}, {
				type: 3,
				name: "name",
				description: "name of the field",
				required: false
			}, {
				type: 3,
				name: "value",
				description: "value of the field",
				required: false
			}, {
				type: 5,
				name: "inline",
				description: "whether this field is inline or not",
				required: false
			}]
		}, {
			type: 1,
			name: "remove",
			description: "remove field",
			options: [{
				type: 3,
				name: "id",
				description: "embed id",
				required: true
			}, {
				type: 4,
				name: "index",
				description: "index in the fields array",
				required: true
			}]
		}, {
			type: 1,
			name: "edit",
			description: "edit field",
			options: [{
				type: 3,
				name: "id",
				description: "embed id",
				required: true
			}, {
				type: 4,
				name: "index",
				description: "index in the fields array (default: end of array)",
				required: true
			}, {
				type: 3,
				name: "name",
				description: "name of the field",
				required: false
			}, {
				type: 3,
				name: "value",
				description: "value of the field",
				required: false
			}, {
				type: 5,
				name: "inline",
				description: "whether this field is inline or not",
				required: false
			}]
		}]
	}]
}]

export default appCommands
