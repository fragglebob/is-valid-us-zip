const fs = require('fs');
const path = require('path');
const es = require('event-stream');
const reduce = require("stream-reduce");

const writeTreeStream = fs.createWriteStream(path.resolve(__dirname, "../zip-tree.js"));

const dictionary = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$";
const dictionarysize = dictionary.length;

const charStart = 32;

const indexToVar = (index) => {
    if (index < dictionarysize) {
        return dictionary[index];
    } else {
        return indexToVar(Math.floor(index / dictionarysize) - 1) + indexToVar(index % dictionarysize);
    }
};

const replaceAt = (str, index, replace) => {
    return str.substring(0, index) + replace + str.substring(index+1)
}

process.stdin
    .pipe(es.split())
    .pipe(es.map((line, cb) => {
        if (line === "") {
            return cb(null, "");
        }
        cb(null, line.substr(49))
    }))
    .pipe(
        reduce((tree, zip) => {

            let treeLevel = tree;
            let len = zip.length;

            for (let i = 0; i < len - 2; i++) {
                const digit = +zip[i];

                if(i + 3 === len) {
                    if (!treeLevel[digit]) {
                        treeLevel[digit] = "";
                    }

                    const secondToFinalDigit = +zip[i + 1];
                    const finalDigit = +zip[i + 2];

                    if(treeLevel[digit].length < secondToFinalDigit+1) {
                        treeLevel[digit] += String.fromCharCode(charStart).repeat((secondToFinalDigit + 1) - treeLevel[digit].length);
                    }

                    console.log(digit, secondToFinalDigit, finalDigit, treeLevel[digit])

                    if (!treeLevel[digit][secondToFinalDigit]) {
                        treeLevel[digit] = replaceAt(treeLevel[digit], secondToFinalDigit, String.fromCharCode(charStart));
                    }

                    

                    let numBit = treeLevel[digit].charCodeAt(secondToFinalDigit) - charStart;

                    numBit |= (1 << (finalDigit));

                    treeLevel[digit] = replaceAt(treeLevel[digit], secondToFinalDigit, String.fromCharCode(numBit + charStart));

                    console.log(treeLevel[digit][secondToFinalDigit], numBit, String.fromCharCode(numBit + charStart))


                } else if (i + 2 === len) {
                    if(treeLevel.length < digit+1) {
                        treeLevel += String.fromCharCode(charStart).repeat(digit+1 - treeLevel.length);
                    }

                    console.log(zip, treeLevel.length)
                    
                    if (!treeLevel[digit]) {
                        treeLevel[digit] = String.fromCharCode(charStart);
                    }
                    const finalDigit = +zip[i + 1];

                    let numBit = treeLevel.charCodeAt(digit) - charStart;
                    numBit |= (1 << (finalDigit));

                    treeLevel[digit] = String.fromCharCode(numBit + charStart)
                } else {
                    if (!treeLevel[digit]) {
                        treeLevel[digit] = [];
                    }
                    treeLevel = treeLevel[digit];
                }
            }

            return tree;

        }, [])
    )
    .pipe(es.map((treeData, cb) => {
        const jsonString = JSON.stringify(treeData);
        const jsString = jsonString
            .replace(/null/g, '') // js can parse something like `[,,,,0]` just fine
            .replace(/1023/g, '-1') // -1 is like 0xFFFFFFFF in bitwise maths, so -1 = 1023, we can save 2 bytes each time
            .replace(/1000/g, '1e3');

       
        cb(null, `module.exports=${jsString}`);
    }))
    .pipe(writeTreeStream)