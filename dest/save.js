import fs from "fs/promises";
const savePath = "./save/";
export function load(path, ignore = false) {
    return fs.readFile(savePath + path + ".json", { encoding: "utf8" })
        .then(data => JSON.parse(data))
        .catch(e => {
        if (e.code == "ENOENT" || ignore)
            return;
        console.error(`Error loading save ${"./saves/" + path}:`, e);
        process.kill(0);
    });
}
export function write(path, content) {
    if (!content)
        return console.error(`Error: save.write(${path}): content empty!`);
    var dirpath = path.split("/").slice(0, -1).join("/");
    fs.mkdir(savePath + dirpath, { recursive: true })
        .catch(e => {
        console.error(`Error creating dir ${"./saves/" + dirpath}:`, e);
        process.kill(0);
    });
    return fs.writeFile(savePath + path + ".json", JSON.stringify(content), { encoding: "utf8" })
        .catch(e => {
        console.error(`Error writing save ${"./saves/" + path}:`, e);
        process.kill(0);
    });
}
export function obj(map) {
    if (!map)
        return {};
    return Object.fromEntries(map);
}
export function map(obj) {
    if (!obj)
        return new Map();
    return new Map(Object.entries(obj));
}
