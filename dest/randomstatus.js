import YSON from "@j0code/yson";
import { client } from "./main.js";
import { activityTypes } from "./apitypes.js";
const activities = await YSON.load("activities.yson");
// compatibility
for (let i = 0; i < activities.length; i++) {
    const act = activities[i];
    act.type = activityTypes[act.type];
}
export function setRandomActivity() {
    let i = Math.floor(Math.random() * activities.length);
    client.user?.setActivity(activities[i]);
}
