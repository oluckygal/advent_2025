import { readFileSync } from 'node:fs';

const SPLITTER = "^";

type Y = number;
type X = number;

function loadFileAsLines(path: string): string[] {
    return readFileSync(path, { encoding: "utf8" }).split("\n")
}

function safelyAddToMappedNumber<Type>(map: Map<Type, number>, location: Type, number: number){
    const mappedValue: undefined | number = map.get(location);
    if (typeof mappedValue === "undefined"){
        map.set(location, number)
        return;
    }
    map.set(location, mappedValue + number)
}

const tachyonGrid : string[] = loadFileAsLines("./input.txt");
const timelineMap: Record<Y, Map<X, number>> = {0: new Map<number, number>()};
timelineMap[0].set(tachyonGrid[0].search("S"), 1);
let splitCounter = 0;
for (let y = 1; y < tachyonGrid.length; y++){
    timelineMap[y] = new Map<number, number>()
    timelineMap[y - 1].forEach((timelines, beamLocation) => {
        if (tachyonGrid[y][beamLocation] !== SPLITTER){
            safelyAddToMappedNumber(timelineMap[y], beamLocation, timelines)
            return;
        }
        splitCounter++;
        safelyAddToMappedNumber(timelineMap[y], beamLocation - 1, timelines)
        safelyAddToMappedNumber(timelineMap[y], beamLocation + 1, timelines)
    })
}

console.log(splitCounter)

let timelineCounter = 0;
timelineMap[tachyonGrid.length - 1].forEach((timelines) => timelineCounter += timelines)
console.log(timelineCounter)