import { readFileSync } from 'node:fs';
import { MachineInfo, parseMachineInfo } from './types/machine-info/machine-info';
import { targetStatePressesSolver } from './solvers/lights/lights';
import { joltagePressesSolver } from './solvers/joltage/joltage';


function loadFileAsLines(path: string): string[] {
    return readFileSync(path, { encoding: "utf8" }).split("\n");
}

function getButtonPressesToSolve(allMachineInfo: MachineInfo[], pressesSolver: (machineInfo: MachineInfo) => number): number {
    let totalButtonPresses = 0;
    for (const machineInfo of allMachineInfo){
        totalButtonPresses += pressesSolver(machineInfo);
    }
    return totalButtonPresses;
}

const rawMachineInfo = loadFileAsLines("./input.txt");
const allMachineInfo: MachineInfo[] = rawMachineInfo.map((machineInfo: string) => parseMachineInfo(machineInfo));

console.log(getButtonPressesToSolve(allMachineInfo, targetStatePressesSolver));
console.log(getButtonPressesToSolve(allMachineInfo, joltagePressesSolver));

