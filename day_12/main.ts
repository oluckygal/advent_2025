import { readFileSync } from 'node:fs';

//this is an np-hard problem as written, but the input has been chosen such that it fits into this much simpler special case

function loadFileAsLines(path: string): string[] {
    return readFileSync(path, { encoding: "utf8" }).split("\n");
}

let triviallyPossible = 0;
const spaceInfo: string[][] = loadFileAsLines("./input.txt").map((line) => line.split(':'));
for (const spaceData of spaceInfo){
    const dimensions: number[] = spaceData[0].split("x").map((dimension: string) => parseInt(dimension, 10))
    const boxesCanFit = dimensions.map((dimension) => Math.floor(dimension / 3));
    const totalBoxes = spaceData[1].trim().split(' ').reduce((boxCount, boxNumberString) => boxCount + parseInt(boxNumberString, 10), 0);
    if (totalBoxes <= (boxesCanFit[0] * boxesCanFit[1])){
        triviallyPossible++;
    }
}
console.log(triviallyPossible)