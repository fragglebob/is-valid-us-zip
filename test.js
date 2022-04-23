
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

it("should should only except strings as input", () => {
    expect(isValidUSZip(20500)).toBe(false);
    expect(isValidUSZip([2, 0, 5, 0, 0])).toBe(false);
});

const validZips = ["50830", "50158", "08360", "89124", "60160", "97819", "22180", "15380"]

validZips.forEach(validZip => {
    it(`should match ${validZip} as a valid zip`, () => {
        expect(isValidUSZip(validZip)).toBe(true);
    })
})

const invalidZips = ["90995", "01804", "78769", "12728", "40945", "56903"];

invalidZips.forEach(invalidZip => {
    it(`should match ${invalidZip} as a not valid zip`, () => {
        expect(isValidUSZip(invalidZip)).toBe(false);
    })
})