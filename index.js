const zipTree = require("./zip-tree");

function findZipInTree(zipCode) {
    let treePosistion = zipTree;

    for (let index = 0; index < zipCode.length - 2; index++) {
        const element = +zipCode[index];
        if(treePosistion[element] == null) {
            return false;
        }
        treePosistion = treePosistion[element]
    }

    if(!treePosistion[+zipCode[3]]) {
        return false;
    }

    const bitValue = (1 << +zipCode[4]);

    return ((treePosistion.charCodeAt(+zipCode[3]) - 32) & bitValue) === bitValue;
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