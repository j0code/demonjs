import { client } from "../main.js";
import MagicMap from "../util/magicmap.js";
import UserManagerUser from "./usermanageruser.js";
const users = new MagicMap();
export default class UserManager {
    constructor() {
        client.on("guildMemberUpdate", (a, b) => {
            if (a.nickname != b.nickname) {
                let user;
                if (users.has(a.id)) {
                    user = users.get(a.id);
                }
                else {
                    user = new UserManagerUser(b.user);
                    users.set(a.id, user);
                }
                if (user)
                    user.updateGuildSettings(b);
            }
        });
    }
    getUser(id) {
        return users.get(id);
    }
}
