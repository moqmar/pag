#!/usr/bin/env node

const fs = require("fs"), path = require("path");
const generate = require("./generate");
global.getWords = async function(lang) {
    const p = path.join(__dirname, "./words/" + lang + ".txt")
    const s = fs.statSync(p);
    const start = generate.randrange(0, s.size - 1024);
    const r = fs.createReadStream(p, {
        flags: 'r',
        encoding: 'utf-8',
        fd: null,
        start: start,
        end: start + 1023
    });
    let words = "";
    let resolve, reject;
    let pr = new Promise((res, rej) => { resolve = res; reject = rej })
    r.on("data", function (chunk) {
         words += chunk;
    });
    r.on("end", function() {
        resolve(words.split("\n").slice(start == 0 ? 0 : 1, -1).filter(x => x.length));
    });
    r.on("error", function(err) {
        reject(err);
    });
    return pr;
}

function help() {
    console.log("pag 1.0.0 - The probably user-friendliest password generator out there.")
    console.log("Usage: " + process.argv0 + " [type][strength] [-c]");
    console.log();
    console.log("  [type]");
    console.log("    A  alphanum");
    console.log("    R  random");
    console.log("    G  gibberish (default)");
    console.log("    D  passphrase-de");
    console.log("    E  passphrase-en");
    console.log();
    console.log("  [strength]");
    console.log("    1|2|3|4  complexity of the password (default: 2)");
    console.log();
    console.log("  [-c]");
    console.log("    Copy to clipboard. Only works on Linux with xclip installed.");
    console.log();
    console.log("Example: " + process.argv0 + " b2 -c");
}

(async function() {
    if (process.argv.slice(2).indexOf("--help") > -1) return help();

    let type = "gibberish";
    let strength = 2;

    let args = process.argv.slice(2)
    let clipboard = false;
    if (args.indexOf("-c") > -1) {
        clipboard = true;
        args.splice(args.indexOf("-c"));
    }
    args = args.join(" ").toLowerCase();

    let replacements = [
        ["alphanum", () => type = "alphanum"],
        ["random", () => type = "random"],
        ["gibberish", () => type = "gibberish"],
        ["passphrase-en", () => type = "passphrase-en"],
        ["passphrase-de", () => type = "passphrase-de"],
        ["a", () => type = "alphanum"],
        ["b", () => type = "random"],
        ["r", () => type = "random"],
        ["c", () => type = "gibberish"],
        ["g", () => type = "gibberish"],
        ["d", () => type = "passphrase-de"],
        ["e", () => type = "passphrase-en"],
    ]
    for (let i = 0; i < replacements.length; i++) {
        if (args != (args = args.replace(replacements[i][0], ""))) {
            replacements[i][1](); break;
        }
    }
    args = args.replace(/[1234]/, x => { strength = parseInt(x); return ""; });

    // Too many arguments!
    if (args.replace(/\s+/g, "").length) return help();

    const pw = await generate(type, strength);
    console.log(pw);

    if (clipboard) {
        // Copy to clipboard using xclip
        const child = require("child_process");
        const p = child.spawn("xclip", ["-se", "c"], { stdio: ["pipe", 1, 1]});
        p.stdin.write(pw);
        p.stdin.end();

        p.on("error", function(error) {
            process.stderr.write("Couldn't copy to clipboard: " + error.message + "\n");
        });
        p.on("exit", function(code, signal) {
            if (code !== 0) {
                process.stderr.write("Couldn't copy to clipboard: exit code " + result.status + " (signal: " + signal + ")\n");
            }
        });
    }
})();
