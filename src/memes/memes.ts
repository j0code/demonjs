import YSON from "@j0code/yson"
import { AttachmentBuilder, AutocompleteInteraction, ChatInputCommandInteraction, InteractionReplyOptions } from "discord.js"
import { client } from "../main.js"
import { registerFont, createCanvas, loadImage, Canvas, Image } from "canvas"

const LINE_HEIGHT = 1.2

interface TemplateText {
	pos: [number, number],
	default?: string,
	font?: string,
	color?: string,
	outline?: string,
	outlineWidth?: number,
	textAlign?: "left" | "center" | "right",
	baseline?: "top" | "middle" | "bottom",
	maxWidth?: number,
	maxHeight?: number,
	maxSize?: number,
	minSize?: number,
	allCaps?: boolean,
	rotate?: number
}

interface Template extends TemplateText {
	name: string,
	image: string,
	texts: TemplateText[],
	names: TemplateText[],
	canvasImage: Image,
	
	font?: string,
	color?: string,
	outline?: string,
	outlineWidth?: number,
	textAlign?: "left" | "center" | "right",
	baseline?: "top" | "middle" | "bottom",
	maxWidth?: number,
	maxHeight?: number,
	maxSize?: number,
	minSize?: number,
	allCaps?: boolean,
	rotate?: number
}

const templates: Template[] = await YSON.load("./memes/templates.yson")

export default async function init() {
	for (let t of templates) {
		t.canvasImage = await loadImage("./memes/templates/" + t.image)
		if (!t.texts) t.texts = []
		if (!t.names) t.names = []
	}

	registerFont("./font/Noto-Regular.ttf", { family: `Noto` })

	client.on("interactionCreate", i => {
		if (i instanceof ChatInputCommandInteraction) onCommand(i)
		if (i instanceof AutocompleteInteraction) onComplete(i)
	})
}

function onCommand(i: ChatInputCommandInteraction) {
	if (i.commandName != "meme") return

	let templateId = i.options.getInteger("template")
	if (!templateId) return

	const template = templates[templateId]
	if (!template) return i.reply({ content: "Template not found.", ephemeral: true })

	const text    = i.options.getString("text")    || template.texts?.[0]?.default || "text"
	const text2   = i.options.getString("text2")   || template.texts?.[1]?.default || "text2"
	const text3   = i.options.getString("text3")   || template.texts?.[2]?.default || "text3"
	const text4   = i.options.getString("text4")   || template.texts?.[3]?.default || "text4"

	const name    = i.options.getString("name")    || template.names?.[0]?.default || "name"
	const name2   = i.options.getString("name2")   || template.names?.[1]?.default || "name2"
	const name3   = i.options.getString("name3")   || template.names?.[2]?.default || "name3"
	const name4   = i.options.getString("name4")   || template.names?.[3]?.default || "name4"

	const content = i.options.getString("content") || ""

	// draw image
	const img = template.canvasImage
	const canvas = createCanvas(img.width, img.height)
	const ctx = canvas.getContext("2d")
	ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

	if (template.texts?.length >= 1) drawText(canvas, ctx, template, template.texts[0], text)
	if (template.texts?.length >= 2) drawText(canvas, ctx, template, template.texts[1], text2)
	if (template.texts?.length >= 3) drawText(canvas, ctx, template, template.texts[2], text3)
	if (template.texts?.length >= 4) drawText(canvas, ctx, template, template.texts[3], text4)

	if (template.names?.length >= 1) drawText(canvas, ctx, template, template.names[0], name)
	if (template.names?.length >= 2) drawText(canvas, ctx, template, template.names[1], name2)
	if (template.names?.length >= 3) drawText(canvas, ctx, template, template.names[2], name3)
	if (template.names?.length >= 4) drawText(canvas, ctx, template, template.names[3], name4)

	const file = new AttachmentBuilder(canvas.toBuffer(), { name: template.name.toLowerCase().replaceAll(/\s/g, "") + ".png", description: template.name })
	const msgOpts: InteractionReplyOptions = { files: [file], ephemeral: false }
	if (content) msgOpts.content = content
	i.reply(msgOpts)

	//i.reply({ content: `template:\n  name: "${template.name}",\n  image: "${template.image}",\n  texts: ${JSON.stringify(template.texts)}\ntext: "${text}"\ntext2: "${text2}"\nname: "${name}"\nname2: "${name2}"\ncontent: "${content}"`, ephemeral: true })
}

function onComplete(i: AutocompleteInteraction) {
	if (i.commandName != "meme") return

	const name = String(i.options.getInteger("template")).toLowerCase()

	if (name.length == 0) { // short cut to return all templates
		let completions = []
		for (let i in templates) {
			if (Number(i) >= 25) break
			completions.push({ name: templates[i].name, value: Number(i) })
		}
		return i.respond(completions)
	}

	// if template is a number, return
	if (!isNaN(Number(name)) && !name.includes(",") && !name.includes("-") && !name.includes("e") && !name.includes("+")) { // has to be a positive integer
		let template = templates[Number(name)]
		if (!template) return i.respond([])
		return i.respond([{ name: template.name, value: Number(name) }])
	}

	let matchingStarts = []
	let matchingIncludes = []
	for (let index in templates) {
		let t = templates[index]
		let tname = t.name.toLowerCase()
		if (name == tname) return i.respond([{ name: t.name, value: Number(index) }])
		if (tname.startsWith(name)) matchingStarts.push({ name: t.name, value: Number(index) })
		else if (tname.includes(name)) matchingIncludes.push({ name: t.name, value: Number(index) })
	}

	i.respond(matchingStarts.concat(matchingIncludes).slice(0, 25))
}

function drawText(canvas: Canvas, ctx: CanvasRenderingContext2D, template: any, text: TemplateText, str: string) {
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

	ctx.font = `${size}px "${font}"`
	ctx.textAlign = textAlign
	ctx.textBaseline = baseline

	// outline
	ctx.strokeStyle = outline
	ctx.lineWidth = outlineWidth

	// text
	ctx.fillStyle = fill

	ctx.save()
	ctx.translate(x, y)
	ctx.rotate(rotate * Math.PI)
	for (let line of lines) {
		ctx.strokeText(line, 0, 0, maxWidth)
		ctx.fillText(line, 0, 0, maxWidth)

		ctx.translate(0, size * LINE_HEIGHT)
	}
	ctx.restore()
}

function fontMetrics(ctx: CanvasRenderingContext2D, font: string, str: string, maxWidth: number, maxHeight: number, minSize: number, maxSize: number) {
	let size = maxSize
	let lines = [str]

	if (size < 16) ctx.font = `lighter ${size}px "${font}"`
	else ctx.font = `${size}px "${font}"`

	while (size > minSize) {
		lines = lineWrap(ctx, str, maxWidth)
		if (lines.length * size * LINE_HEIGHT > maxHeight) {
			size--
			if (size < 16) ctx.font = `lighter ${size}px ${font}`
			else ctx.font = `${size}px ${font}`
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

function lineWrap(ctx: CanvasRenderingContext2D, str: string, maxWidth: number) {
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
