import { ansify, AnsiCode, Logger } from "./logger.js";
import { client, config } from "./main.js";
import { fetchAPI, fetchUser, rest, RestError } from "./rest.js";
import { users as wordCountUsers } from "./word_counter/word_count.js";
const logger = new Logger("OAuth2", AnsiCode.fg_green);
const oauthStore = new Map(); // user id -> data
const loglevel = {
    ERROR: { name: "error", emoji: "💢", color: AnsiCode.fg_red },
    AUTH: { name: "auth", emoji: "🔐", color: AnsiCode.fg_light_green },
    INFO: { name: "info", emoji: "ℹ️", color: AnsiCode.fg_white }
};
export default async function oauthInit() {
    rest.get('/', async (req, res) => {
        let code = req.query.code;
        if (!code)
            return res.redirect(getDefaultBotInvite());
        let data;
        try {
            data = await fetchAuthCode(code);
            //console.log("[OAuth]: Fetched authorization_code!", code, data)
        }
        catch (e) {
            if (e instanceof RestError && ["invalid_grant"].includes(e.data?.error)) {
                return res.redirect(getDefaultBotInvite());
            }
            logger.log(loglevel.ERROR, `fetching authorization_code`, code, e);
            return res.status(500).end();
        }
        let userResult;
        try {
            userResult = await fetchUser(data.token_type, data.access_token);
            //console.log("[OAuth]: User data:", userResult)
        }
        catch (e) {
            logger.log(loglevel.ERROR, `fetching user data`, e);
            return res.status(500).end();
        }
        let oauthData = {
            id: userResult.id,
            access_token: data.access_token,
            token_type: data.token_type,
            refresh_token: data.refresh_token,
            scope: data.scope.split(" ")
        };
        oauthStore.set(userResult.id, oauthData);
        //console.log(`[OAuth]: User authorization with scope [${data.scope}] by ${userResult.username}#${userResult.discriminator} (${userResult.id})`)
        logger.log(loglevel.AUTH, ansify `authorized with scope ${AnsiCode.fg_blue}[${data.scope}]${AnsiCode.fg_light_grey} by ${AnsiCode.fg_light_blue}${userResult.username}#${userResult.discriminator}${AnsiCode.fg_dark_grey} (${userResult.id})`);
        if (data.scope.includes("role_connections.write")) {
            try {
                await updateMetadata(userResult.id);
            }
            catch (e) {
                logger.log(loglevel.ERROR, `updating user metadata`, e);
                return res.status(500).end();
            }
        }
        return res.sendFile("./html/index.html", { root: "." });
    });
    rest.get("/connect", (req, res) => {
        res.redirect(getConnectBotInvite());
    });
    try {
        logger.log(loglevel.INFO, `updating role connection metadata...`);
        let metadata = await setConMetadata();
        logger.log(loglevel.INFO, `updated role connection metadata!`);
    }
    catch (e) {
        logger.log(loglevel.ERROR, `updating role connection metadata`, e);
    }
}
function getDefaultBotInvite() {
    return `https://discord.com/oauth2/authorize?client_id=${config.oauth.id}&redirect_uri=${config.oauth.redirect_uri}&response_type=code&scope=${config.oauth.scope.default}&permissions=${config.oauth.permissions}`;
}
function getConnectBotInvite() {
    return `https://discord.com/oauth2/authorize?client_id=${config.oauth.id}&redirect_uri=${config.oauth.redirect_uri}&response_type=code&scope=${config.oauth.scope.connect}`;
}
async function updateMetadata(id) {
    let oauthData = oauthStore.get(id);
    if (!oauthData)
        return;
    let metadata = {
        word_count: (wordCountUsers.get(oauthData.id)?.total || 0) + ""
    };
    let user = await client.users.fetch(oauthData.id);
    let username = user.username || "demon.js platform user";
    return await fetchAPI({
        method: "PUT",
        endpoint: `/users/@me/applications/${config.oauth.id}/role-connection`,
        body: {
            platform_name: "demon.js",
            platform_username: username,
            metadata
        },
        headers: {
            Authorization: `${oauthData.token_type} ${oauthData.access_token}`,
            "Content-Type": "application/json"
        }
    });
}
function fetchAuthCode(code) {
    return fetchAPI({
        method: "POST",
        endpoint: `/oauth2/token`,
        body: {
            client_id: config.oauth.id,
            client_secret: config.oauth.token,
            code,
            grant_type: 'authorization_code',
            redirect_uri: `http://localhost:${config.rest.port}`,
            scope: config.oauth.scope
        },
        bodyEncoding: "urlencoded",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    });
}
function setConMetadata() {
    return fetchAPI({
        method: "PUT",
        endpoint: `/applications/${config.oauth.id}/role-connections/metadata`,
        body: config.connections.metadata,
        headers: {
            Authorization: `Bot ${config.token}`,
            "Content-Type": "application/json"
        }
    });
}
