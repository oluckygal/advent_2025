import { readFileSync } from 'node:fs';

function loadFileLines(path: string): string[] {
    return readFileSync(path, { encoding: "utf8" }).trim().split("\n");
}

function getHighestDigitAddr(cell: string){
    let bestAddr = 0;
    let bestDigit = -1;
    for (let i = 0; i < cell.length; i++){
        const currentDigit: number = parseInt(cell[i]);
        if (currentDigit > bestDigit){
            bestAddr = i;
            bestDigit = currentDigit;
        }
        if (bestDigit === 9){
            break;
        }
    }
    return bestAddr;
}

function constructNumberFromCharacterArray(charArray: string[], radix = 10): number {
    const numString = charArray.reduce((numStrAccumulator: string, digit: string) => numStrAccumulator.concat(digit), "");
    return parseInt(numString, radix);
}

function getCellJoltage(cell: string, digits: number): number {
    const digitArray: string[] = [];
    let lastAddr = -1;
    for (let place = 1; place <= digits; place++){
        lastAddr = getHighestDigitAddr(cell.substring(lastAddr + 1, cell.length - digits + place)) + lastAddr + 1;
        digitArray.push(cell[lastAddr]);
    }
    return constructNumberFromCharacterArray(digitArray, 10);
}

const cellArray: string[] = loadFileLines('./input.txt');

let totalJoltage = 0;
for (const cell of cellArray){
    totalJoltage += getCellJoltage(cell, 2);
}
console.log(totalJoltage)
totalJoltage = 0
for (const cell of cellArray){
    totalJoltage += getCellJoltage(cell, 12)
}
console.log(totalJoltage)
