const zipTree = require("./zip-tree");

function findZipInTree(zip) {

    let treePos = zipTree;

    for (let i = 0; i < zip.length - 1; i++) {
        const zi = +zip[i];
        if(treePos[zi] == null) {
            return false;
        }
        treePos = treePos[zi]
    }

    const bitValue = (1 << (9-zip[4]));

    return (treePos & bitValue) !== bitValue;
}

function isValidUSZip(zipCode) {

    if(typeof zipCode !== "string") {
        return false;
    }

    if(zipCode.length !== 5) {
        return false;
    }

    if(zipCode.match(/^\d{5}$/) === null) {
        return false;
    }

    return findZipInTree(zipCode);
}

module.exports = isValidUSZip;