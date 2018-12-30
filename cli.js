#!/usr/bin/env node

global.getWords = lang => require("./words/" + lang + ".json");
const generate = require("./generate");

function help() {
    console.log("pag 1.0.0 - The probably user-friendliest password generator out there.")
    console.log("Usage: " + process.argv0 + " [type][strength] [-c]");
    console.log();
    console.log("  [type]");
    console.log("    A  random");
    console.log("    B  gibberish (default)");
    console.log("    C  passphrase-en");
    console.log("    D  passphrase-de");
    console.log();
    console.log("  [strength]");
    console.log("    1|2|3|4  complexity of the password (default: 2)");
    console.log();
    console.log("  [-c]");
    console.log("    Copy to clipboard. Only works on Linux with xclip installed.");
    console.log();
    console.log("Example: " + process.argv0 + " a2 -c");
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
        ["random", () => type = "random"],
        ["gibberish", () => type = "gibberish"],
        ["passphrase-en", () => type = "passphrase-en"],
        ["passphrase-de", () => type = "passphrase-de"],
        ["a", () => type = "random"],
        ["b", () => type = "gibberish"],
        ["c", () => type = "passphrase-en"],
        ["d", () => type = "passphrase-de"],
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