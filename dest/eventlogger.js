import { logEvent } from "./logger.js";
import { events, on } from "./util/clientevents.js";
export default function logEvents(client, logApiEvents = false, logShardEvents = false, debug = false) {
    if (!client || !client.on)
        return console.trace("eventlogger.logEvents(client) requires client of type Discord.Client");
    /*on([events.ANY, events.GATEWAY], handler)
    if(logApiEvents)   on(events.API, handler)
    if(logShardEvents) on(events.SHARD, handler)*/
    on(["ready", "guildCreate", "interactionCreate"], handler);
    if (debug)
        on("debug", handler);
    /*for(let ename of evts) client.on(ename, (a,b) => {
        var user = userB = guild = channel = "undefined"
        if(a) {
            var user = a.author || a.user || (["userUpdate"].includes(ename) ? a : undefined)
            var guild = a.guild || a.message?.guild || (["guildCreate","guildDelete"].includes(ename) ? a : undefined)
            var channel = a.channel || a.message?.channel || (["channelCreate","channelDelete"].includes(ename) ? a : undefined)
        }
        if(b) {
            var userB = b.author || b.user || (["userUpdate","messageReactionAdd","messageReactionRemove","messageReactionRemoveAll"].includes(ename) ? b : undefined)
        }
        var usertag = (user ? user.tag : undefined) || "Unknown User"
        var userBtag = (userB ? userB.tag : undefined) || "Unknown User"
        var guildname = (guild ? guild.name : undefined) || "Unknown Guild"
        var channelname = (channel ? channel.name : undefined) || "Unknown Channel"
        switch(ename) {
            case "ready":
            log(ename, `Logged in as ${client.user.tag}!`)
            break

            case "messageCreate":
            case "messageDelete":
            log(ename, `${guildname} #${channelname} @${usertag}: ${a.content}`)
            break

            case "messageUpdate":
            log(ename, `${guildname} #${channelname} @${usertag}: ${a.content} -> ${b.content}`)
            break

            case "channelCreate":
            case "channelDelete":
            log(ename, `${guildname} #${channelname}`)
            break

            case "channelUpdate":
            log(ename, `${guild} #${channelname} -> #${b.name}`)
            break

            case "guildCreate":
            case "guildDelete":
            log(ename, `${guildname}`)
            break

            case "interactionCreate":
            log(ename, `${usertag}: /${a.commandName} ${a.options._subcommand || ""}`)
            break

            case "presenceUpdate":
            log(ename, `${b.guild.name ? b.guild.name : ""} @${b.user.tag}: ${a && a.status} -> ${b && b.status}`)
            break

            case "userUpdate":
            log(ename, `@${usertag} ${a.accentColor} ${a.verified} -> @${userBtag} ${b.accentColor} ${b.verified}`)
            break

            case "webhookUpdate":
            log(ename, `${guildname} #${a.name}`)
            break

            case "messageReactionAdd":
            case "messageReactionRemove":
            log(ename, `${guildname} #${channelname} ${userBtag} ${a.emoji.name}`)
            break

            case "rateLimit":
            log(ename, `${a.method} ${a.path} ${a.limit/1000}s; global: ${a.global}; limit: ${a.limit}`)
            break

            case "typingStart":
            log(ename, `${guildname} #${channelname} @${usertag}`)
            break

            case "voiceStateUpdate":
            log(ename, `${guildname} #${channelname} @${usertag}`)
            break

            default:
            log(ename, a, b)
        }
    })*/
}
function log(e, ...content) {
    let o = getEventOptions(e);
    logEvent(o, ...content);
}
function handler(data) {
    const msgguildname = data.guild?.name || "DM";
    const msgchannelname = data.channel?.name || data.channel?.recipient?.tag;
    const authortag = data.author?.tag || "unknown_user#0000";
    let changes = [];
    if (data.changes)
        for (let k of Object.keys(data.changes)) {
            if (["permissionOverwrites"].includes(k))
                continue;
            let before = data.changes[k].before;
            let now = data.changes[k].now;
            if (before && before.toString != Object.prototype.toString)
                before = before + "";
            if (now && now.toString != Object.prototype.toString)
                now = now + "";
            changes.push(`${k}:`);
            changes.push(before);
            changes.push("->");
            changes.push(now);
            changes.push(";");
        }
    if (changes[changes.length - 1] == "; ")
        changes.pop(); // remove last "; "
    try {
        switch (data.e) {
            case "ready":
                log(data.e, `Logged in as ${data?.client?.user?.tag}!`);
                break;
            case "messageCreate":
            case "messageDelete":
                log(data.e, `${msgguildname} #${msgchannelname} @${authortag}: ${data?.message?.content}`);
                break;
            case "messageUpdate":
                log(data.e, `${msgguildname} #${msgchannelname} @${authortag}:`, ...changes);
                break;
            case "channelCreate":
            case "channelDelete":
                log(data.e, `${msgguildname} #${msgchannelname}`);
                break;
            case "channelUpdate":
                log(data.e, `${data?.guild} #${data.channel?.name}:`, ...changes);
                break;
            case "guildCreate":
            case "guildDelete":
                log(data.e, `${data.guild?.name}`);
                break;
            case "interactionCreate":
                log(data.e, `${data.user?.tag}: /${data.interaction?.commandName} ${data.interaction?.options?._group || ""} ${data.interaction?.options?._subcommand || ""}`);
                break;
            case "presenceUpdate":
                log(data.e, `${data.guild?.name ? data.guild?.name : ""} @${data.user?.tag}:`, ...changes);
                break;
            case "userUpdate":
                log(data.e, `@${data.user?.tag}:`, ...changes);
                break;
            case "webhookUpdate":
                log(data.e, `${data.guild?.name} #${data.channel?.name}:`, ...changes);
                break;
            case "messageReactionAdd":
            case "messageReactionRemove":
                log(data.e, `${data.guild?.name} #${data.channel?.name} ${data.user?.tag} ${data.reaction?.emoji?.name}`);
                break;
            case "rateLimit":
                log(data.e, `${data.rateLimitData.method} ${data.rateLimitData.path} ${data.rateLimitData.limit / 1000}s; global: ${data.rateLimitData.global}`);
                break;
            case "typingStart":
                log(data.e, `${data.guild?.name} #${data.channel?.name} @${data.user?.tag}`);
                break;
            case "voiceStateUpdate":
                log(data.e, `${data.guild?.name} #${data.channel?.name} @${data.user?.tag}:`, ...changes);
                break;
            case "guildMemberUpdate":
                log(data.e, `${data.guild?.name} @${data.user?.tag}:`, ...changes);
                break;
            default:
                if (events.groups.UPDATE.includes(data.e)) {
                    log(data.e, ...changes);
                }
                else
                    log(data.e, data.toJSON());
        }
    }
    catch (e) {
        console.dir(data.toJSON(), { depth: 0 });
        console.log("Error: EventLogger: ", e);
    }
}
function getEventOptions(e) {
    if (events.SHARD.includes(e))
        return { e, emoji: "✨", color: "93" };
    if ("channelPinsUpdate" == e)
        return { e, emoji: "📌" };
    if ("error" == e)
        return { e, emoji: "🔴", color: "41;97" };
    if ("guildCreate" == e)
        return { e, emoji: "➡️ ", color: "32" };
    if ("guildDelete" == e)
        return { e, emoji: "⬅️ ", color: "91" };
    if ("interactionCreate" == e)
        return { e, emoji: "🔥", color: "95" };
    if (["invalidRequestWarning", "rateLimit", "warn"].includes(e))
        return { e, emoji: "⚠️ ", color: "43;90" }; // 🟡
    if (["messageCreate", "messageUpdate"].includes(e))
        return { e, emoji: "✍️ ", color: "34" }; // 💬📝
    if ("ready" == e)
        return { e, emoji: "✅", color: "92" };
    if ("threadListSync" == e)
        return { e, emoji: "🔁" };
    if ("typingStart" == e)
        return { e, emoji: "💬" };
    if ("voiceStateUpdate" == e)
        return { e, emoji: "🎤" }; // 🎙️
    if ("webhookUpdate" == e)
        return { e, emoji: "⚓" };
    if (e.includes("guildBan"))
        return { e, emoji: "🚫" };
    if (e.includes("thread"))
        return { e, emoji: "🧵" };
    if (e.includes("Add"))
        return { e, emoji: "➕", color: "32" };
    if (e.includes("Remove"))
        return { e, emoji: "➖", color: "91" };
    if (e.includes("Create"))
        return { e, emoji: "🟢", color: "32" };
    if (e.includes("Update"))
        return { e, emoji: "🔄", color: "94" };
    if (e.includes("Delete"))
        return { e, emoji: "❌", color: "91" };
    return { e, emoji: "  " };
}
