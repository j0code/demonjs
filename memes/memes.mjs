import YSON from "@j0code/yson"
import Discord from "discord.js"
import { client } from "../main.mjs"
import { createCanvas, loadImage } from "canvas"

const LINE_HEIGHT = 1.2

const templates = await YSON.load("./memes/templates.yson")

export default async function init() {
	for (let t of templates) {
		t.canvasImage = await loadImage("./memes/templates/" + t.image)
	}

	client.on("interactionCreate", i => {
		if(i.type == "APPLICATION_COMMAND") onCommand(i)
		if(i.type == "APPLICATION_COMMAND_AUTOCOMPLETE") onComplete(i)
	})
}

function onCommand(i) {
	if (i.commandName != "meme") return

	const template = templates[i.options.getInteger("template")]
	if (!template) return i.reply({ content: "Template not found.", ephemeral: true })

	const text    = i.options.getString("text")    || template.texts?.[0]?.default || "text"
	const text2   = i.options.getString("text2")   || template.texts?.[1]?.default || "text2"
	const name    = i.options.getString("name")    || template.names?.[0]?.default || "name"
	const name2   = i.options.getString("name2")   || template.names?.[1]?.default || "name2"
	const content = i.options.getString("content") || ""

	// draw image
	const img = template.canvasImage
	const canvas = createCanvas(img.width, img.height)
	const ctx = canvas.getContext("2d")
	ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

	if (template.texts?.length >= 1) drawText(canvas, ctx, template, template.texts[0], text)
	if (template.texts?.length >= 2) drawText(canvas, ctx, template, template.texts[1], text2)
	if (template.names?.length >= 1) drawText(canvas, ctx, template, template.names[0], name)
	if (template.names?.length >= 2) drawText(canvas, ctx, template, template.names[1], name2)

	const file = new Discord.MessageAttachment(canvas.toBuffer(), template.name.toLowerCase().replaceAll(/\s/g, "") + ".png")
	const msgOpts = { files: [file], ephemeral: false }
	if (content) msgOpts.content = content
	i.reply(msgOpts)

	//i.reply({ content: `template:\n  name: "${template.name}",\n  image: "${template.image}",\n  texts: ${JSON.stringify(template.texts)}\ntext: "${text}"\ntext2: "${text2}"\nname: "${name}"\nname2: "${name2}"\ncontent: "${content}"`, ephemeral: true })
}

function onComplete(i) {
	if (i.commandName != "meme") return

	const name = i.options.getInteger("template").toLowerCase()
	console.log(name)
	
	if (!isNaN(name) && !name.includes(",") && !name.includes("-") && !name.includes("e") && !name.includes("+")) { // has to be a positive integer
		let template = templates[Number(name)]
		if (!template) return i.respond([])
		return i.respond([{ name: template.name, value: Number(name) }])
	}

	let matchingStarts = []
	let matchingIncludes = []
	for (let index in templates) {
		let t = templates[index]
		let tname = t.name.toLowerCase()
		if (name == tname) return i.respond([{ name: t.name, value: index }])
		if (tname.startsWith(name)) matchingStarts.push({ name: t.name, value: index })
		else if (tname.includes(name)) matchingIncludes.push({ name: t.name, value: index })
	}

	i.respond(matchingStarts.concat(matchingIncludes))
}

function drawText(canvas, ctx, template, text, str) {
	let font = text.font || template.font || "sans-serif"
	let fill = text.color || template.color || "white"
	let outline = text.outline || template.outline || "black"
	let outlineWidth = text.outlineWidth || template.outlineWidth || 2
	let textAlign = text.textAlign || template.textAlign || "center"
	let baseline = text.baseline || template.baseline || "middle"
	let maxWidth = text.maxWidth || template.maxWidth || canvas.width
	let maxHeight = text.maxHeight || template.maxHeight || canvas.height
	let maxSize = text.maxSize || template.maxSize || 51
	let minSize = text.minSize || template.minSize || 5
	let allCaps = text.allCaps ?? template.allCaps ?? true
	if (allCaps) str = str.toUpperCase()
	let { size, lines } = fontMetrics(ctx, font, str, maxWidth, maxHeight, minSize, maxSize)
	let rotate = text.rotate || template.rotate || 0

	let [x, y] = text.pos
	if (baseline == "bottom") {
		y -= size * (lines.length-1) * LINE_HEIGHT
	}
	if (baseline == "middle") {
		y -= size/2 * (lines.length-1) * LINE_HEIGHT
	}

	ctx.font = size + "px " + font
	ctx.textAlign = textAlign
	ctx.textBaseline = baseline

	// outline
	ctx.strokeStyle = outline
	ctx.lineWidth = outlineWidth

	// text
	ctx.fillStyle = fill

	for (let line of lines) {
		ctx.save()
		ctx.translate(x, y)
		ctx.rotate(rotate * Math.PI)
		ctx.strokeText(line, 0, 0, maxWidth)
		ctx.fillText(line, 0, 0, maxWidth)
		ctx.restore()

		y += size * LINE_HEIGHT
	}
}

function fontMetrics(ctx, font, str, maxWidth, maxHeight, minSize, maxSize) {
	let size = maxSize
	let lines = [str]

	ctx.font = size + "px " + font

	while (size > minSize) {
		lines = lineWrap(ctx, str, maxWidth)
		if (lines.length * size * LINE_HEIGHT > maxHeight) {
			size--
			ctx.font = size + "px " + font
		}
		else break
	}

	/*while (ctx.measureText(str).width > maxWidth && size > 1) {
		if (size > minSize) size--
		else {
			size = maxSize
			lineCount++
			lines = splitLines(str, lineCount)
		}

		ctx.font = size + "px " + font
	}*/

	return { size, lines }
}

function lineWrap(ctx, str, maxWidth) {
	let words = str.split(" ")
	let lines = []
	let line = ""
	for (let w of words) {
		//console.log(line, w)
		if (ctx.measureText(line + w).width > maxWidth) {
			lines.push(line.substring(0, line.length-1)) // remove trailing space
			line = ""
		}
		line += w + " "
	}
	lines.push(line.substring(0, line.length-1)) // remove trailing space
	return lines
}