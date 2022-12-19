import fs from "fs/promises";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import YSON from "@j0code/yson";
const rest = new REST({ version: "10" });
const path = "./interactions";
const files = await fs.readdir(path);
let cmds = [];
for (let f of files) {
    if (!f.endsWith(".yson"))
        continue;
    let data = "";
    try {
        data = await fs.readFile(path + "/" + f, { encoding: "utf-8" });
    }
    catch (e) {
        console.error(`[interactions.mjs] load ${f}:`, e);
        continue;
    }
    if (data) {
        try {
            data = await YSON.parse(data);
            cmds = cmds.concat(data);
        }
        catch (e) {
            console.error(`load ${f}:`, e);
        }
    }
}
export async function updateAppCommands(token, id) {
    if (!id)
        return;
    console.log("Commands:", cmds);
    rest.setToken(token);
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(Routes.applicationCommands(id), { body: cmds });
        console.log('Successfully reloaded application (/) commands.');
    }
    catch (error) {
        console.error(error);
    }
}
