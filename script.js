// Storage and selections
let type = localStorage.getItem("type") || "gibberish";
let strength = localStorage.getItem("strength") || 2;
function setType(v) {
    type = v;
    localStorage.setItem("type", v);
    [...document.querySelectorAll(".active[data-type]")].forEach(x => x.classList.remove("active"));
    document.querySelector("[data-type=\"" + v + "\"]").classList.add("active");
    setTimeout(update);
}
function setStrength(v) {
    strength = v;
    localStorage.setItem("strength", v);
    [...document.querySelectorAll(".active[data-strength]")].forEach(x => x.classList.remove("active"));
    document.querySelector("[data-strength=\"" + v + "\"]").classList.add("active");
    setTimeout(update);
}
setType(type);
setStrength(strength);

// Actual password generation
let working = 0;
let workingType = 0;
let workingStrength = 0;
function update() {
    if (working > 0) return working++;
    working = 1; workingType = type; workingStrength = strength;
    document.querySelector(".update").classList.add("working");
    generate(type, strength)
        .then(pw => {
            document.querySelector("code").textContent = pw;

            if (working > 1 && (workingType != type || workingStrength != strength)) { working = 0; update(); }
            else { working = 0; document.querySelector(".update").classList.remove("working"); selectText(); }
        })
        .catch(err => {
            console.error(err);
            alert("Couldn't generate a password: " + err.message);

            if (working > 1 && (workingType != type || workingStrength != strength)) { working = 0; update(); }
            else { working = 0; document.querySelector(".update").classList.remove("working"); }
        })
}

// Word lists
let wordList = {};
async function getWords(lang) {
    if (wordList[lang] != null) return wordList[lang];
    let r = await fetch("./words/" + lang + ".json", {
        method: "HEAD"
    })
    if ((window.location.hash||"").match(/nochunks/) || (r.headers.get("accept-ranges")||"").match(/^$|^none$/)) {
        if ((window.location.hash||"").match(/nochunks/) || confirm("Passphrases require a word list. As this server doesn't support partial requests, the full list needs to be downloaded to generate passphrases.\n\nDownload size: " + (r.headers.get("content-length") / 1024 / 1024).toFixed(2) + " MB")) {
            wordList[lang] = await fetch("./words/" + lang + ".json").then(r => r.json());
            return wordList[lang];
        } else {
            setTimeout(() => setType("gibberish"));
            throw new Error("Word list download was interrupted");
        }
    }
    let start = randrange(1, r.headers.get("content-length") - 1025);
    let h = new Headers();
    h.append("Range", "bytes=" + start + "-" + (parseInt(start + 1024)));
    let t = await fetch("./words/" + lang + ".json", {
        headers: h
    }).then(r => r.text());
    let m = t.match(/^(?:"?[^"]*")?,(".*[^,]")(?:$|,(?:"[^"]*)?$)/);
    if (!m) throw new Error("Unexpected response");
    return JSON.parse("[" + m[1] + "]");
}

// Keyboard shortcuts
window.addEventListener("keydown", function(event) {
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    switch (event.key) {
        case "1": setStrength(1); break;
        case "2": setStrength(2); break;
        case "3": setStrength(3); break;
        case "4": setStrength(4); break;
        case "A": case "a": setType("alphanum"); break;
        case "B": case "b": setType("random"); break;
        case "C": case "c": setType("gibberish"); break;
        case "D": case "d": setType("passphrase-de"); break;
        case "E": case "e": setType("passphrase-en"); break;
        case " ": update();
    }
})

function selectText() {
    let r = document.createRange();
    let w=document.querySelector("code");
    r.selectNodeContents(w);
    let sel=window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
}
