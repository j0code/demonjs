import { stalk } from "./main.js";
import { camelToUpper } from "./util/util.js";
export function getLogTimeString(date = new Date()) {
    var s = date.getSeconds();
    var min = date.getMinutes();
    var h = date.getHours();
    var d = date.getDate();
    var m = date.getMonth() + 1;
    var y = date.getFullYear();
    return y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d) + " " + (h < 10 ? "0" + h : h) + ":" + (min < 10 ? "0" + min : min) + ":" + (s < 10 ? "0" + s : s);
}
export function logEvent(o, ...content) {
    var e = camelToUpper(o.e || "");
    var esc = "\u001B";
    console.log(`${esc}[90m${getLogTimeString()}${esc}[37m ${o.emoji || "  "} ${esc}[${o.color || "0"}m${e}${esc}[0;37m`, ...content);
}
export function logStalkEvents() {
    //stalk.on("witness", (e, user) => logEvent({ e: "witness", emoji: "🕵️ ", color: "90" }, user.user?.tag + ": " + e))
    //stalk.on("statusUpdate", (user, status, deviceStatus) => logEvent("statusUpdate", "🕵️ ", user.user?.tag, status, deviceStatus))
    stalk.on("active", async (user) => {
        //console.log("active", user, user.user)
        let dcuser = await user.getUser();
        logEvent({ e: "active", emoji: "🕵️ ", color: "90" }, `${dcuser.tag}`);
    });
    stalk.on("inactive", async (user) => {
        let dcuser = await user.getUser();
        logEvent({ e: "inactive", emoji: "🕵️ ", color: "90" }, `${dcuser.tag}`);
    });
}
