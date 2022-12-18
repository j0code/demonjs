export function compare(a, b) {
    if (a === b)
        return true;
    if ([a, b].includes(null))
        return false;
    if (typeof a != "object" || typeof b != "object" || !compareArray(Object.keys(a), Object.keys(b)))
        return false;
    for (var key in a) {
        if (a[key] !== b[key])
            return false;
    }
    return true;
}
function compareArray(a, b) {
    if (a.length != b.length)
        return false;
    for (var i in a) {
        if (a[i] !== b[i])
            return false;
    }
    return true;
}
export function checkAny(s, arr, func) {
    let f = s[func];
    if (!(f instanceof Function))
        return;
    for (let i = 0; i < arr.length; i++) {
        if (f(arr[i]))
            return i;
    }
    return null;
}
export function checkAll(s, arr, func) {
    let f = s[func];
    if (!(f instanceof Function))
        return;
    for (let i = 0; i < arr.length; i++) {
        if (!f(arr[i]))
            return i;
    }
    return null;
}
export function camelToUpper(s, dlm = "_") {
    let matches = s.matchAll(/[A-Z]/g);
    let chars = s.split("");
    for (let match of matches)
        if (match.index && match.index > 0)
            chars[match.index] = dlm + s[match.index];
    return chars.join("").trim().toUpperCase();
}
export function autocomplete(list, condition, choice, max = 25) {
    let arr = [];
    for (let e of list.entries()) {
        if (condition(e[0], e[1])) {
            let c = choice(e[0], e[1]);
            if (c.name.length > 100 || String(c.value).length > 100)
                continue; // no results with length >100 allowed
            arr.push(c);
        }
        if (arr.length >= 25 || arr.length >= max)
            break;
    }
    return arr;
}
