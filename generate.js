let vocals = "aeiou";
let consonants = "bcdfghjklmnpqrstvwxyz";
let special = "0123456789!$%&/=()?*-.,;:_#+<>@";
let separator = "-._,+!=@";
let random = vocals + vocals.toUpperCase() + consonants + consonants.toUpperCase() + special;
let alphanum = vocals + vocals.toUpperCase() + consonants + consonants.toUpperCase() + "0123456789";

const crypto = (typeof window === "undefined" ? {getRandomValues:(arr) => require("crypto").randomFillSync(arr)} : window.crypto);

function randrange(min, max) {
    var range = max - min;
    if (range <= 0) {
        throw new Exception('max must be larger than min');
    }
    var requestBytes = Math.ceil(Math.log2(range) / 8);
    if (!requestBytes) { // No randomness required
        return min;
    }
    var maxNum = Math.pow(256, requestBytes);
    var ar = new Uint8Array(requestBytes);

    while (true) {
        crypto.getRandomValues(ar);

        var val = 0;
        for (var i = 0;i < requestBytes;i++) {
            val = (val * Math.pow(2, 8)) + ar[i];
        }

        if (val < maxNum - maxNum % range) {
            return min + (val % range);
        }
    }
}
function r(arr) {
    return arr[randrange(0, arr.length)];
}

async function generate(type, strength) {
    let pw = "";

    if (type == "alphanum") {
        let len = [10,16,24,32][strength-1];
        for (let i = 0; i < len; i++) {
            pw += r(alphanum);
        }
    } else if (type == "random") {
        let len = [10,16,24,32][strength-1];
        for (let i = 0; i < len; i++) {
            pw += r(random);
        }
    } else if (type == "gibberish") {
        let len = [10,16,24,32][strength-1];
        let nextWord = 0;
        let startType = randrange(0, 2);
        for (let i = 0; i < len; i++) {
            let c = r(i % 2 === startType ? vocals : consonants);
            if (nextWord-- <= 0 && i < len - 2) {
                if (pw.length) c = (
                    strength > 1 ? r(separator) + // random separator if strength > 1, otherwise use a dash
                    (strength > 2 && randrange(0,3) == 0 ? randrange(1,1000) + r(separator) : "") // add random numbers randomly for strong passwords
                        : "-") + c;
                c = c.toUpperCase();
                nextWord = randrange(3, 7);
            }
            pw += c;
        }
    } else if (type.match(/^passphrase-/)) {
        let len = [2,2,3,4][strength-1];
        for (let i = 0; i < len; i++) {
            let w = r(await getWords(type.substr(11)));
            for (let j = 0; j < (strength > 3 ? w.length : strength > 1 ? 1 : 0); j++) { // capitalize first letter randomly on strength 2 or 3, capitalize everything randomly for extreme passwords
                if (randrange(0, 2) > 0) { // capitalize
                    w = w.substr(0, j) + w.substr(j, 1).toUpperCase() + w.substr(j+1);
                }
            }
            pw += (i == 0 ? "" : strength < 2 ? "-" :
                r(separator) +
                (strength > 2 && randrange(0,3)==0 ? randrange(1,10000) + r(separator) : "")) +
                w;
        }
        if (strength == 2) pw += r(separator) + randrange(1,1000);
    }

    return pw;
}

if (typeof module !== "undefined") module.exports = generate;
