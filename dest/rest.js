import express from "express";
import { AnsiCode, Logger } from "./logger.js";
import { config } from "./main.js";
export class RestError {
    url;
    status;
    headers;
    data;
    constructor(url, status, headers, data) {
        this.url = url;
        this.status = status,
            this.headers = headers;
        this.data = data;
    }
}
const logger = new Logger("rest", AnsiCode.fg_yellow);
export const rest = express();
export function restInit() {
    rest.listen(config.rest.port, () => logger.log({ name: "info", emoji: " ℹ", color: AnsiCode.fg_white }, `listening at http://localhost:${config.rest.port}`));
}
export function fetchAPI(options) {
    let body = undefined;
    if (options.bodyEncoding == "urlencoded")
        body = new URLSearchParams(options.body).toString();
    else
        body = JSON.stringify(options.body);
    //console.log(options, body)
    return fetch(`https://discord.com/api${options.endpoint}`, {
        method: options.method,
        body,
        headers: options.headers
    }).then(async (res) => {
        let data = null;
        try {
            data = await res.json();
        }
        catch (ignore) { }
        if (res.status != 200) {
            throw new RestError(res.url, res.status, res.headers, data);
        }
        return data;
    });
}
export function fetchUser(tokenType, token) {
    return fetchAPI({
        method: "GET",
        endpoint: `/users/@me`,
        headers: {
            Authorization: `${tokenType} ${token}`
        }
    });
}
