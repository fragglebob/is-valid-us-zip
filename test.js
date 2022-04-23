
const { expect } = require("@jest/globals");
const isValidUSZip = require("./index");

it("should return false for our invalid zip code lengths", () => {
    expect(isValidUSZip("4444")).toBe(false);
    expect(isValidUSZip("444444")).toBe(false);
})

it("should return true for the white house's zip code", () => {
    expect(isValidUSZip("20500")).toBe(true);
});

it("should return false for an invalid zip code", () => {
    expect(isValidUSZip("00000")).toBe(false);
    expect(isValidUSZip("75000")).toBe(false);
    expect(isValidUSZip("99999")).toBe(false);
});

it("should return false for non numeric chacter", () => {
    expect(isValidUSZip("abcde")).toBe(false);
    expect(isValidUSZip("!@#$%")).toBe(false);
});

it("should only except strings as input", () => {
    expect(isValidUSZip(20500)).toBe(false);
    expect(isValidUSZip([2, 0, 5, 0, 0])).toBe(false);
});

const codes = ["03073", "97011", "95352", "38848", "57570", "19492", "51103"];

codes.forEach(code => {
    it("should return true for this code " + code, () => {
        expect(isValidUSZip(code)).toBe(true);
    })
    
})

