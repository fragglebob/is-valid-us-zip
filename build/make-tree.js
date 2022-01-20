const fs = require('fs');
const path = require('path');
const es = require('event-stream');
const reduce = require("stream-reduce");

const writeTreeStream = fs.createWriteStream(path.resolve(__dirname, "../zip-tree.js"));

process.stdin
    .pipe(es.split())
    .pipe(es.map((line, cb) => {
        if(line === "") {
            return cb(null, "");
        }
        cb(null, line.substr(49))
    }))
    .pipe(
        reduce((tree, zip) => {

            let treeLevel = tree;
            let len = zip.length;

            for (let i = 0; i < len - 1; i++) {
                const digit = +zip[i];

                if(i + 2 === len) {
                    if(!treeLevel[digit]) {
                        treeLevel[digit] = 0;
                    }
                    const finalDigit = +zip[i+1];
                    treeLevel[digit] |= (1 << (finalDigit));
                } else {
                    if(!treeLevel[digit]) {
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
            .replace(/1023/g, '-1'); // -1 is like 0xFFFFFFFF in bitwise maths, so -1 = 1023, we can save 2 bytes each time
        cb(null, `module.exports = ${jsString}`);
    }))
    .pipe(writeTreeStream)