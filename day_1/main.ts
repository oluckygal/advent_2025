import { readFileSync } from 'node:fs';
enum Direction {
    Left = -1,
    Right = 1
}
interface Instruction {
    readonly direction: Direction;
    readonly distance: number;
}
interface Dial {
    pointingAt: number;
    readonly size: number;
}


function loadFileLines(path: string): string[]{
    return readFileSync(path, {encoding: "utf8"}).trim().split("\n");
}

function stringToInstruction(value: string): Instruction {
    return {
        direction: value.startsWith("L") ? Direction.Left : Direction.Right,
        distance: parseInt(value.substring(1), 10)
    }
}

function spinDialAndCountClicks(dial: Dial, instruction: Instruction): number {
    const newPosition : number = dial.pointingAt + instruction.distance * instruction.direction;
    let clicks = 0;
    if (newPosition < 0){
        clicks = Math.floor(Math.abs(newPosition / dial.size)) + 1;
        if (dial.pointingAt === 0){
            clicks--;
        }
        dial.pointingAt = ((newPosition % dial.size) + dial.size) % dial.size;
    }
    else if (dial.size <= newPosition){
        clicks = Math.floor(newPosition / dial.size)
        dial.pointingAt = newPosition % dial.size;
    } else {
        dial.pointingAt = newPosition;
    }
    if (newPosition === 0){
        clicks = 1;
    }

    return clicks;
}

const rawInstructions: string[] = loadFileLines('./input.txt');
const instructions: Instruction[] = rawInstructions.map(stringToInstruction);

const dial: Dial = {pointingAt: 50, size: 100};
let clickCounter = 0;
let clickAtEndOfInstructionCounter = 0;
for (const instruction of instructions){
    clickCounter += spinDialAndCountClicks(dial, instruction);
    // console.log(dial.pointingAt)
    if (dial.pointingAt === 0){
        clickAtEndOfInstructionCounter++;
    }
}
console.log(clickAtEndOfInstructionCounter);
console.log(clickCounter);
