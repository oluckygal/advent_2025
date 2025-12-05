import { readFileSync } from 'node:fs';

const INVALID_RANGE_STRING_ERROR_MESSAGE = "Invalid string for making range:";
const NAN_RANGE_ERROR_MESSAGE = "Attempted to create a range with NaN value";

class Range {
    readonly max: number;
    readonly min: number;

    constructor(rangeNumber1: number, rangeNumber2: number){
        if (isNaN(rangeNumber1 + rangeNumber2)){
            throw new Error(NAN_RANGE_ERROR_MESSAGE);
        }
        this.min = Math.min(rangeNumber1, rangeNumber2);
        this.max = Math.max(rangeNumber1, rangeNumber2);
    }
}

function loadFileAsMultipleDataSets(path: string): string[][] {
    return readFileSync(path, { encoding: "utf8" }).trim().split("\n\n").map((line) => line.trim().split("\n"));
}

function rangeStringToRange(rangeString: string): Range {
    const splitString : string[] = rangeString.split("-");
    if (splitString.length !== 2){
        throw new Error(`${INVALID_RANGE_STRING_ERROR_MESSAGE} ${rangeString}`);
    }
    const rangeNums: number[] = splitString.map((rangeNumberString: string) => parseInt(rangeNumberString, 10));
    return new Range(rangeNums[0], rangeNums[1]);
}

function rangeComparator(range1: Range, range2: Range): number{
    return range1.min - range2.min;
}

function combineRanges(range1: Range, range2: Range): Range | undefined{
    if (range1.min > range2.max || range2.min > range1.max){
        return;
    }
    return new Range(Math.min(range1.min, range2.min), Math.max(range1.max, range2.max));
}

function reduceSortedRanges(ranges: Range[]): Range[]{
    const simplifiedRanges : Range[] = [];
    for (const range of ranges){
        if (simplifiedRanges.length === 0){
            simplifiedRanges.push(range);
            continue;
        }
        const combinedRange = combineRanges(simplifiedRanges[simplifiedRanges.length - 1], range);
        if (typeof combinedRange === "undefined"){
            simplifiedRanges.push(range);
            continue;
        }
        simplifiedRanges[simplifiedRanges.length - 1] = combinedRange;
    }
    return simplifiedRanges;
}

function countFreshIngredients(ingredientIds: number[], sortedRanges: Range[]): number{
    let counter = 0;
    for (const ingredientId of ingredientIds){
        for (const range of sortedRanges){
            if (range.min <= ingredientId && range.max >= ingredientId){
                counter++;
                break;
            }
            if (range.min > ingredientId){
                break;
            }
        }
    }
    return counter;
}

function countTotalRangeCoverage(nonOverlapingRanges: Range[]): number{
    let totalRangeCounter = 0;
    for (const range of nonOverlapingRanges){
        totalRangeCounter += (range.max - range.min + 1);
    }
    return totalRangeCounter;
}


const datasets : string[][] = loadFileAsMultipleDataSets("./input.txt");
const ranges : Range[] = datasets[0].map((rangeString: string) => rangeStringToRange(rangeString)).sort()
ranges.sort(rangeComparator)
const simplifiedRanges: Range[] = reduceSortedRanges(ranges);

const ingredientIds: number[] = datasets[1].map((ingredientIdString: string) => parseInt(ingredientIdString, 10));
console.log(countFreshIngredients(ingredientIds, simplifiedRanges))

console.log(countTotalRangeCoverage(simplifiedRanges))
