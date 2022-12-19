import { CategoryChannel, ForumChannel, PartialGroupDMChannel, StageChannel } from "discord.js";
import { client } from "../main.js";
const pocTime = 45000; // 45s
const typingTime = 11000; // 11s
const typingUsers = new Map();
export function listen() {
    client.on("typingStart", typing => {
        //console.log("bef", typingUsers)
        let now = Date.now();
        let channels = getTypingChannels(typing.user.id);
        let o = getTypingChannel(channels, typing.channel.id);
        if (o)
            o.last = now;
        //typing.channel.send(`${typing.user.tag} has been typing for ${(now - o.begin)/1000}s`)
        //console.log("aft", typingUsers)
    });
    client.on("messageCreate", msg => {
        let now = Date.now();
        let channels = getTypingChannels(msg.author.id);
        if (!channels || !channels.has(msg.channel.id))
            return;
        let o = channels.get(msg.channel.id);
        if (!o)
            return;
        channels.delete(msg.channel.id);
        if (now - o.begin > pocTime) {
            msg.channel.send(`${msg.author} pócced after ${(now - o.begin) / 1000}s and ${o.pocs} pócs.`);
        }
        if (o.msg) {
            o.msg.delete()
                .catch((e) => console.error("[Typing/ERROR]: Could not delete poc msg:", e));
        }
    });
}
export function update() {
    let now = Date.now();
    for (let uid of typingUsers.keys()) {
        let channels = typingUsers.get(uid);
        if (!channels)
            continue;
        for (let cid of channels.keys()) {
            let o = channels.get(cid);
            let c = client.channels.cache.get(cid);
            if (!o || !c || c instanceof CategoryChannel || c instanceof StageChannel || c instanceof PartialGroupDMChannel || c instanceof ForumChannel)
                continue;
            if (now - o.last > typingTime) {
                channels.delete(cid);
                if (o.msg) {
                    o.msg.delete()
                        .catch((e) => console.error("[Typing/ERROR]: Could not delete poc msg:", e));
                }
            }
            else if (now - o.begin > pocTime) {
                o.pocs++;
                if (!o.msg) {
                    c.send("póc").then((m) => { if (!o)
                        return; o.msg = m; })
                        .catch((e) => console.error("[Typing/ERROR]: Could not send poc msg:", e));
                }
                else {
                    o.msg.edit(`póc (${o.pocs})`).then((m) => { if (!o)
                        return; o.msg = m; })
                        .catch((e) => console.error("[Typing/ERROR]: Could not edit poc msg:", e));
                }
            }
        }
    }
}
function getTypingChannels(id) {
    let channels;
    if (!typingUsers.has(id)) {
        channels = new Map();
        typingUsers.set(id, channels);
    }
    else {
        channels = typingUsers.get(id);
    }
    return channels;
}
function getTypingChannel(channels, id) {
    //console.log(channels)
    if (!channels)
        return;
    let now = Date.now();
    let o;
    if (!channels.has(id)) {
        //console.log("no")
        o = { begin: now, last: now, msg: null, pocs: 0 };
        channels.set(id, o);
    }
    else {
        //console.log("ye")
        o = channels.get(id);
    }
    return o;
}
