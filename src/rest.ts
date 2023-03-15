import express, { Request, Response } from "express"
import { AnsiCode, Logger } from "./logger.js"
import { config } from "./main.js"

type FetchOptions = {
	method: "GET" | "POST" | "PUT" | "PATCH",
	endpoint: string,
	body?: any
	bodyEncoding?: "json" | "urlencoded" // default to json
	headers?: any
}

export class RestError {

	url: string
	status: number
	headers: any
	data: any

	constructor(url: string, status: number, headers: any, data: any) {
		this.url = url
		this.status = status,
		this.headers = headers
		this.data = data
	}

}

const logger = new Logger("rest", AnsiCode.fg_yellow)

export const rest = express()

export function restInit() {
	rest.listen(config.rest.port, () => logger.log({ name: "info",  emoji: " ℹ", color: AnsiCode.fg_white}, `listening at http://localhost:${config.rest.port}`))
}

export function fetchAPI(options: FetchOptions) {
	let body: string | undefined = undefined
	if (options.bodyEncoding == "urlencoded") body = new URLSearchParams(options.body).toString()
	else body = JSON.stringify(options.body)

	//console.log(options, body)

	return fetch(`https://discord.com/api${options.endpoint}`, {
		method: options.method,
		body,
		headers: options.headers
	}).then(async res => {
		let data: any = null
		try {
			data = await res.json()
		} catch (ignore) {}
		if (res.status != 200) {
			throw new RestError(res.url, res.status, res.headers, data)
		}
		return data
	})
}

export function fetchUser(tokenType: string, token: string) {
	return fetchAPI({
		method: "GET",
		endpoint: `/users/@me`,
		headers: {
			Authorization: `${tokenType} ${token}`
		}
	})
}