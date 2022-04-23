const fs = require('fs');
const path = require('path');
const es = require('event-stream');
const reduce = require("stream-reduce");

const writeTreeStream = fs.createWriteStream(path.resolve(__dirname, "../zip-tree.js"));

const dictionary = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$";
const dictionarysize = dictionary.length;

const indexToVar = (index) => {
    if (index < dictionarysize) {
        return dictionary[index];
    } else {
        return indexToVar(Math.floor(index / dictionarysize) - 1) + indexToVar(index % dictionarysize);
    }
};

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

            for (let i = 0; i < len - 1; i++) {
                const digit = +zip[i];

                if (i + 2 === len) {
                    if (!treeLevel[digit]) {
                        treeLevel[digit] = 1023;
                    }
                    const finalDigit = zip[i + 1];
                    treeLevel[digit] ^= (1 << (9-finalDigit));
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

        console.log("Pre number optimize size", `module.exports=${jsString}`.length);

        const numberRegex = /(-?[0-9]+|1e3)/gi;

        const matches = jsString.matchAll(numberRegex);

        const numberCount = new Map();

        for (const match of matches) {
            const number = match[0];
            if (numberCount.has(number)) {
                numberCount.set(number, numberCount.get(number) + 1);
            } else {
                numberCount.set(number, 1);
            }
        }
        const numbersToOptimize = [...numberCount.entries()]
            .map(([number, count]) => ({
                number,
                count,
                var1saved: (count * (number.length - 1)) - (3 + number.length),
                var2saved: (count * (number.length - 2)) - (4 + number.length)
            }))
            .sort((a, b) => b.var1saved - a.var1saved);

        const var1SizeNumbers = numbersToOptimize.slice(0, 2 * 26)
            .map(({ number, count, var1saved }) => ({ number, count, saved: var1saved }));

        const var2SizeNumbers = numbersToOptimize
            .slice(2 * 26)
            .sort((a, b) => b.var2saved - a.var2saved)
            .map(({ number, count, var2saved }) => ({ number, count, saved: var2saved }));

        const orderedNumbers = [
            ...var1SizeNumbers,
            ...var2SizeNumbers
        ]
            .filter(a => a.saved > 0)
            .map((a, index) => ({ ...a, varName: indexToVar(index) }))

        const vars = orderedNumbers.map((a) => a.varName + "=" + a.number)
            .join(",")

        const varsMap = orderedNumbers.reduce((obj, a) => {
            obj[a.number] = a.varName;
            return obj;
        }, {});

        const optimizedJsString = jsString.replace(numberRegex, (substring) => {
            if (!varsMap[substring]) {
                return substring;
            }
            return varsMap[substring];
        });

        console.log("Post number optimize size", `const ${vars};\nmodule.exports=${optimizedJsString}`.length, 22680);
        cb(null, `const ${vars};\nmodule.exports=${optimizedJsString}`);
    }))
    .pipe(writeTreeStream)