import { readFileSync } from 'node:fs';
class IDRange {
    readonly maxRange: number;
    readonly minRange: number;
    constructor(rangeString: string) {
        const rangeNums: number[] = rangeString.split("-").map((numStr: string) => parseInt(numStr, 10));
        this.maxRange = Math.max(...rangeNums);
        this.minRange = Math.min(...rangeNums);
    }
}

function loadFileEntries(path: string): string[] {
    return readFileSync(path, { encoding: "utf8" }).trim().split(",");
}

function constructSmallestInvalidIDWithMoreDigits(digits: number, repeaterLength: number): number{
    const repeater: string = "1".concat("0".repeat(repeaterLength - 1));
    return parseInt(repeater.repeat(Math.floor(digits / repeaterLength) + 1), 10);
}

function findNextBiggestInvalidID(num: number, length: number, orEqual?: boolean): number {
    const numString: string = num.toString(10);
    let repeater = "";
    if (numString.length % length !== 0 || num < 10) {
        return constructSmallestInvalidIDWithMoreDigits(numString.length, length);
    }
    repeater = numString.substring(0, length)
    const invalidId: number = parseInt(repeater.repeat(numString.length / length));
    if (invalidId > num || (invalidId === num && orEqual)) {
        return invalidId;
    }
    if (invalidId + 1 === 10 ** numString.length){
        return constructSmallestInvalidIDWithMoreDigits(numString.length, length);
    }
    repeater = (parseInt(repeater, 10) + 1).toString(10);
    return parseInt(repeater.repeat(numString.length / length), 10);
}

function sumInvalidIDsWithRepeaterLengthInRange(range: IDRange, repeaterLength: number, usedCache: Map<number, boolean>): number {
    let toCheckID: number = findNextBiggestInvalidID(range.minRange, repeaterLength, true);
    let totalInvalid = 0;
    while (toCheckID <= range.maxRange) {
        if (!usedCache.get(toCheckID)) {
            totalInvalid += toCheckID;
            usedCache.set(toCheckID, true);
        }
        toCheckID = findNextBiggestInvalidID(toCheckID, repeaterLength, false);
    }
    return totalInvalid;
}

function sumInvalidIDsInRange(range: IDRange, usedCache: Map<number, boolean>): number {
    let totalInvalid = 0;
    const halfMaxIdLength: number = Math.floor(range.maxRange.toString(10).length / 2)
    for (let repeaterLength = 1; repeaterLength <= halfMaxIdLength; repeaterLength++) {
        totalInvalid += sumInvalidIDsWithRepeaterLengthInRange(range, repeaterLength, usedCache);
    }
    return totalInvalid;
}

const rawRanges: string[] = loadFileEntries('./input.txt');
const idRanges: IDRange[] = rawRanges.map((rangeStr: string) => new IDRange(rangeStr))
let totalInvalid = 0;
const tested: Map<number, boolean> = new Map<number, boolean>();
for (const range of idRanges) {
    totalInvalid += sumInvalidIDsInRange(range, tested)
}

console.log(totalInvalid)
