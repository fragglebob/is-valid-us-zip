const fs = require('fs');
const path = require('path');
const es = require('event-stream');
const reduce = require("stream-reduce");

const zipTreeStream = fs.createWriteStream(path.resolve(__dirname, "../zip-tree.json"));

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

            for (let i = 0; i < zip.length; i++) {
                const digit = +zip[i];

                if(i + 1 === zip.length) {
                    treeLevel.push(digit);
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
    .pipe(es.stringify())
    .pipe(zipTreeStream)