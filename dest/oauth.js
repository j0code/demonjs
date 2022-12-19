import express from "express";
import fetch from "node-fetch";
import { config } from "./main.js";
export default function oauthInit() {
    const app = express();
    app.get('/', async (req, res) => {
        let code = req.query.code;
        if (!code)
            return res.end(400);
        const data = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: new URLSearchParams({
                client_id: config.rest.oauthId,
                client_secret: config.rest.oauthToken,
                code,
                grant_type: 'authorization_code',
                redirect_uri: `http://localhost:${config.rest.port}`,
                scope: 'identify',
            }).toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }).then(res => res.json())
            .catch(e => {
            console.log(`[OAuth]: Error fetching authorization_code`, e);
        });
        console.log("[OAuth]: Fetched authorization_code!", code, data);
        const userResult = await fetch('https://discord.com/api/users/@me', {
            headers: {
                authorization: `${data.token_type} ${data.access_token}`,
            },
        }).then(res => res.json());
        console.log("[OAuth]: User data:", userResult);
        return res.sendFile("./html/index.html", { root: "." });
    });
    app.listen(config.rest.port, () => console.log(`App listening at http://localhost:${config.rest.port}`));
}
