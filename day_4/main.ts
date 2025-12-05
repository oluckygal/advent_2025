import { readFileSync } from 'node:fs';

class Grid<Type> {
    x_size: number
    y_size: number
    private gridArray: Type[][]
    constructor(gridArray: Type[][]){
        this.x_size = gridArray.reduce((minRowSize, row) => Math.min(minRowSize, row.length), Number.MAX_SAFE_INTEGER);
        this.y_size = gridArray.length;
        this.gridArray = gridArray;
    }

    get(x: number, y: number): Type | undefined {
        if (x >= this.x_size || y >= this.y_size || x < 0 || y < 0){
            return undefined;
        }
        return this.gridArray[y][x];
    }

    set(x: number, y: number, value: Type): void {
        this.gridArray[y][x] = value;
    }
}

interface Coordinate{
    x: number,
    y: number
}

function loadFileCharGrid(path: string): string[][] {
    return readFileSync(path, { encoding: "utf8" }).trim().split("\n").map((line) => line.split(""));
}

function checkNeighbourCount<Type>(grid: Grid<Type>, coord: Coordinate, neighbourValue: Type, maximumCount: number): boolean {
    let neighbourCounter = 0;
    for (let x_pointer: number = coord.x - 1; x_pointer <= coord.x + 1; x_pointer++){
        for (let y_pointer: number = coord.y - 1; y_pointer <= coord.y + 1; y_pointer++){
            if (x_pointer === coord.x && y_pointer === coord.y){
                continue;
            }
            if (grid.get(x_pointer, y_pointer) === neighbourValue){
                neighbourCounter++;
                if (neighbourCounter > maximumCount){
                    return false;
                }
            }
        }
    }
    return true;
}

function getRemovablePaperAddrs(paperGrid: Grid<string>): Coordinate[]{
    const removablePaperAddrs: Coordinate[] = [];
    for (let x_pointer = 0; x_pointer < paperGrid.x_size; x_pointer++){
        for (let y_pointer = 0; y_pointer < paperGrid.y_size; y_pointer++){
            const coord: Coordinate = {x: x_pointer, y: y_pointer};
            if (paperGrid.get(x_pointer, y_pointer) === PAPER && 
                checkNeighbourCount(paperGrid, coord, PAPER, 3)){
                removablePaperAddrs.push(coord);
            }
        }
    }
    return removablePaperAddrs;
}

function removePapers(paperGrid: Grid<string>, toRemove: Coordinate[]){
    const EMPTY = "."
    for (const coord of toRemove){
        paperGrid.set(coord.x, coord.y, EMPTY)
    }
}

const PAPER = "@";
const paperGrid: Grid<string> = new Grid<string>(loadFileCharGrid('./input.txt'));
let accessibleCounter = 0;
let toRemove : Coordinate[] = [];
do {
    removePapers(paperGrid, toRemove)
    toRemove = getRemovablePaperAddrs(paperGrid);
    accessibleCounter += toRemove.length
    console.log(accessibleCounter);
} while (toRemove.length > 0)
