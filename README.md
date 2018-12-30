# pag - a password generator

Generates **random strings**, gibberish (**pronounceable passwords**), or "*correct-horse-battery-staple*" **passphrases in English or German**. 

## web app

The probably user-friendliest password generator out there - just enter the address, press enter and Ctrl+C the password to your clipboard.

There are no prerequisites - just put it into a directory served by any webserver. Or use my public instance:

#### ➜ https://pag.mo-mar.de

Tip of the ~~day~~ decade: press the keys 1-4 to select a strength, and A-D to select a generator. 

## command line

A simple command-line interface for password generation. Requires [node.js & npm](https://nodejs.org).

```bash
$ npm install -g pag-cli
$ pag --help
$ pag        # medium gibberish
$ pag a3     # strong random
$ pag a3 -c  # copy to clipboard (linux only, requires xclip)
```

## is it secure?

**Quick answer: probably** - passwords are completely generated client-side using the [window.crypto](https://developer.mozilla.org/en-US/docs/Web/API/Window/crypto) API, the connection to the public instance is secured using HTTPS, there are no requests to third-party servers, and I don't collect any information about you (not even your IP address).
  
There is one thing that might be an issue for you: when using *passphrases*, the word lists are requested from the server in chunks of 1024 KB (the full lists are a couple of Megabytes in size, I don't want to make the page slow or consume lots of bandwidth), so the server could theoretically see *how many passwords you generated and which words are probably used in your passwords*. I personally don't collect or use any of that information from the public instance, but please at least make sure that you're on an HTTPS connection.  
**If this is an issue for you, please use the command line app, or append [#nochunks](https://pag.mo-mar.de/#nochunks) to the URL. This will require up to 30 MB to be downloaded though!**

Fun fact: the German passphrases are more secure because there are more German words.

---

> Thanks for the following content provided by other people:
> - Web Font: [Iosevka Term](http://typeof.net/Iosevka/)
> - English Word List: [dwyl/english-words](https://github.com/dwyl/english-words)
> - German Word List: [all-the-german-words-ascii](http://npm.im/all-the-german-words-ascii)
