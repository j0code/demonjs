import { EventEmitter } from "events";
import { client } from "../main.js";
import MagicMap from "../util/magicmap.js";
import * as save from "../save.js";
import StalkUser from "./stalkuser.js";
import { BaseInteraction, Presence } from "discord.js";
const userEvents = ["emojiCreate", "guildMemberAdd", "guildScheduledEventCreate", "guildScheduledEventUserAdd", "guildScheduledEventUserRemove", "interactionCreate"];
userEvents.push("inviteCreate", "messageCreate", "messageReactionAdd", "messageUpdate", "presenceUpdate", "stickerCreate", "typingStart", "userUpdate", "voiceStateUpdate");
const debugChannel = "943264045866291240";
var saveData = await save.load("stalk", true) || await save.load("backup/stalk", true) || {};
var users;
export default class Stalk extends EventEmitter {
    #activeUsers; // needed to allow them to emit 'inactive'
    constructor() {
        super();
        users = MagicMap.fromObject(saveData.users, StalkUser);
        writeBackup();
        //console.log("Stalk", ...(users.conarr))
        this.#activeUsers = new Set();
        var stalk = this;
        for (let ename of userEvents)
            client.on(ename, (a, b) => {
                if (["emojiCreate", "guildMemberAdd", "guildScheduledEventCreate", "interactionCreate", "inviteCreate", "messageCreate", "messageUpdate", "stickerCreate", "typingStart"].includes(ename)) {
                    stalk.onUserEvent(ename, a.author || a.user || a.creator || a.inviter, a, b);
                }
                else if (["guildScheduledEventUserAdd", "guildScheduledEventUserRemove", "messageReactionAdd", "userUpdate"].includes(ename))
                    stalk.onUserEvent(ename, b, a, b);
                else if (["presenceUpdate", "voiceStateUpdate"].includes(ename))
                    stalk.onUserEvent(ename, (a && a.user) || (b && b.user), a, b);
                else
                    console.error("Stalk: Error: new Stalk(): unknown event", ename);
            });
        for (let user of users.values()) {
            user.on("seen", (...e) => this.emit("seen", user, ...e));
            user.on("statusUpdate", (...e) => this.emit("statusUpdate", user, ...e));
            user.on("active", (...e) => {
                this.emit("active", user, ...e);
                this.#activeUsers.add(user.id);
            });
            user.on("inactive", (...e) => {
                this.emit("inactive", user, ...e);
                this.#activeUsers.delete(user.id);
            });
            if (user.active)
                this.#activeUsers.add(user.id);
        }
    }
    onUserEvent(ename, user, a, b) {
        if (a && "webhookId" in a)
            return; // ignore webhuks
        if (!user)
            return console.error("Stalk: Error: onUserEvent(): no user");
        var userid = user.id;
        if (userid == client.user?.id)
            return; // don't self-stalk
        var stalkUser = users.get(userid);
        if (!stalkUser) {
            stalkUser = new StalkUser(user.id);
            stalkUser.on("seen", (...e) => { }); // do not emit since already emitted 'witness'
            stalkUser.on("statusUpdate", (...e) => this.emit("statusUpdate", stalkUser, ...e));
            stalkUser.on("active", (...e) => {
                this.emit("active", stalkUser, ...e);
                this.#activeUsers.add(user.id);
            });
            stalkUser.on("inactive", (...e) => {
                this.emit("inactive", stalkUser, ...e);
                this.#activeUsers.delete(user.id);
            });
            users.set(userid, stalkUser);
        }
        if (a instanceof Presence && b instanceof Presence) {
            if (b.status != "offline" && b.status != a.status)
                stalkUser.seen(); // don't count "going offline" as witness
            else
                stalkUser.presence = b;
        }
        else {
            stalkUser.seen();
            if (b && !(b instanceof BaseInteraction) && "member" in b)
                stalkUser.presence = b.member?.presence;
        }
        //var c = client.channels.cache.get(debugChannel)
        //if(!c) return console.error("Stalk: Error: onUserEvent(): debug channel missing or unavailable")
        //c.send("Witness of presence: " + user.tag + ": " + ename)
        this.emit("witness", ename, stalkUser);
        writeSave();
    }
    getUser(id) {
        return users.get(id);
    }
    update() {
        for (let id of this.#activeUsers) {
            var user = this.getUser(id);
            if (!user)
                return this.#activeUsers.delete(id);
            user.update();
        }
    }
}
function writeSave() {
    save.write("stalk", { users });
}
function writeBackup() {
    save.write("backup/stalk", { users });
}
