import { MachineInfo } from "../../types/machine-info/machine-info";
import { 
    getButtonsInRow, 
    roundFloatingPointDriftedInteger, 
    checkRowHasNegativeCoeficients, 
    checkRowHasPositiveCoeficients } from "./joltage-matrix-utils";

import { machineInfoToButtonJoltageMatrix, convertJoltageMatrixToReducedRowEchelon } from "./joltage-matrix-factory";

class ButtonPressLedger {
    private _buttonPresses: number[]
    private _totalPresses: number
    constructor(length: number){
        this._buttonPresses = new Array<number>(length).fill(-1); 
        this._totalPresses = 0;
    }

    setPresses(button: number, presses: number){
        if (this._buttonPresses[button] < 0){
            this._totalPresses += presses;
        } else {
            this._totalPresses += (presses - this._buttonPresses[button]);
        }
        this._buttonPresses[button] = presses;
    }

    clearPresses(button: number){
        this._totalPresses -= this._buttonPresses[button];
        this._buttonPresses[button] = -1;
    }

    getPresses(button: number){
        return this._buttonPresses[button];
    }

    get totalPresses() {
        return this._totalPresses;
    }

    logPresses(){
        console.log(JSON.stringify(this._buttonPresses));
    }

}

export function substituteVariablesAndRearrange(buttonSolvingFor: number, row: number[], pressValues: ButtonPressLedger){
    const rearrangedRow: number[] = [...row];
    for (let button = 0; button < rearrangedRow.length - 1; button++){
        if (button === buttonSolvingFor){
            continue;
        }
        if (pressValues.getPresses(button) >= 0){
            rearrangedRow[rearrangedRow.length - 1] = roundFloatingPointDriftedInteger(
                rearrangedRow[rearrangedRow.length - 1] - rearrangedRow[button] * pressValues.getPresses(button)
            );
            rearrangedRow[button] = 0;
        }
    }
    return rearrangedRow;
}

function addDirectionalConstraint(direction: number, coefficient: number, constantTerm: number, range: [number, number]): [number, number] | undefined {
    const rangeCopy: [number, number] = [...range];
    if (direction * coefficient < 0){
        const potentialMinPresses = Math.ceil(roundFloatingPointDriftedInteger(constantTerm / coefficient));
        if (potentialMinPresses > rangeCopy[1]){
            return;
        }
        rangeCopy[0] = Math.max(potentialMinPresses, rangeCopy[0]);
        return rangeCopy;
    }
    const potentialMaxPresses = Math.floor(roundFloatingPointDriftedInteger(constantTerm / coefficient));
    if (potentialMaxPresses < rangeCopy[0]){
        return;
    }
    rangeCopy[1] = Math.min(potentialMaxPresses, rangeCopy[1]);
    return rangeCopy;
}

function solveExactButtonPressValue(coefficient: number, constantTerm: number, rangeConstraint: [number, number]): number | undefined {
    if (coefficient * constantTerm < 0){
        return;
    }
    const potentialPresses = roundFloatingPointDriftedInteger(constantTerm / coefficient);
    if (potentialPresses < rangeConstraint[0] || potentialPresses > rangeConstraint[1] || !Number.isInteger(potentialPresses)){
        return;
    }
    return potentialPresses;
}

function findButtonPushRange(button: number, reducedMatrix: number[][], commitedPresses: ButtonPressLedger, maximumPresses: number): [number, number] | undefined{
    let pushRange: [number, number] = [0, maximumPresses] 
    for (const row of reducedMatrix){
        if (row[button] === 0){
            continue;
        }
        const substitutedRow = substituteVariablesAndRearrange(button, row, commitedPresses);
        const hasNegative = checkRowHasNegativeCoeficients(substitutedRow, button);
        const hasPositive = checkRowHasPositiveCoeficients(substitutedRow, button);

        const netConstantTerm = substitutedRow[substitutedRow.length - 1];
        if (!hasNegative && !hasPositive){
            const exactPresses = solveExactButtonPressValue(row[button], netConstantTerm, pushRange);
            if (typeof exactPresses === "undefined"){
                return;
            }
            pushRange = [exactPresses, exactPresses];
            continue;
        }
        if ((hasNegative && hasPositive) || row[button] * netConstantTerm < 0){
            continue;
        }
        const direction: number = hasNegative ? -1 : 1;
        const newRange: [number, number] | undefined = addDirectionalConstraint(direction, row[button], netConstantTerm, pushRange);
        if (typeof newRange === "undefined"){
            return;
        }
        pushRange = newRange;
    }
    return pushRange;
}

function createLedgerOfTriviallySolvedPresses(reducedMatrix: number[][]){
    const numberOfButtons = reducedMatrix[0].length - 1;
    const buttonPresses: ButtonPressLedger = new ButtonPressLedger(numberOfButtons);
    
    for (const row of reducedMatrix){
        const buttonsInvolved = getButtonsInRow(row);
        const targetValue = row[row.length - 1];
        if (buttonsInvolved.length === 1){
            buttonPresses.setPresses(buttonsInvolved[0], targetValue);
            //buttonSolved[buttonsInvolved[0]] = true;
        }
    }
    return buttonPresses;
}

function markSolvedPresses(numberOfButtons: number, buttonPresses: ButtonPressLedger): boolean[]{
    const buttonSolved: boolean[] = Array<boolean>(numberOfButtons).fill(false);
    for (let button = 0; button < numberOfButtons; button++){
        if (buttonPresses.getPresses(button) >= 0){
            buttonSolved[button] = true;
        }
    }
    return buttonSolved;
}

function matrixToButtonPresses(reducedMatrix: number[][], buttonPressCaps: number[], maximumTotalPresses: number){
    const numberOfButtons = reducedMatrix[0].length - 1;
    const buttonPresses: ButtonPressLedger = createLedgerOfTriviallySolvedPresses(reducedMatrix);
    const buttonSolved: boolean[] = markSolvedPresses(numberOfButtons, buttonPresses);
    let bestSolution = Number.POSITIVE_INFINITY;
    const buttonRangeQueue:[number, number][] = [];
    let button = numberOfButtons - 1;
    while (button < numberOfButtons) {
        const queueAddress = numberOfButtons - button - 1;
        if (queueAddress > buttonRangeQueue.length - 1){
            const buttonRange = findButtonPushRange(button, reducedMatrix, buttonPresses, buttonPressCaps[button]);
            if (typeof buttonRange === "undefined" || 
                (!buttonSolved[button] && buttonRange[0] + buttonPresses.totalPresses >= Math.min(maximumTotalPresses + 1, bestSolution))){
                button++;
                continue;
            }
            if (button === 0) {
                bestSolution = Math.min(buttonPresses.totalPresses + (buttonSolved[button] ? 0 : buttonRange[0]), bestSolution);
                button++;
                continue;
            }
            buttonRangeQueue.push(buttonRange);
        }
        if (buttonRangeQueue[queueAddress][0] > buttonRangeQueue[queueAddress][1]){
            if (!buttonSolved[button]){
                buttonPresses.clearPresses(button);
            }
            buttonRangeQueue.pop();
            button++;
            continue;
        }
        buttonPresses.setPresses(button, buttonRangeQueue[queueAddress][0]);
        buttonRangeQueue[queueAddress][0]++;
        button--;
    }
    return bestSolution <= maximumTotalPresses ? bestSolution : -1;
}

export function joltagePressesSolver(machineInfo: MachineInfo): number {
    const prioritisedButtonSchenmatics: number[][] = machineInfo.arrayButtonSchematics.sort((schematic1, schematic2) => schematic1.length - schematic2.length);
    const joltageMatrix = machineInfoToButtonJoltageMatrix(machineInfo.joltageRequirements, prioritisedButtonSchenmatics);
    const reducedMatrix = convertJoltageMatrixToReducedRowEchelon(joltageMatrix);
    const buttonPressCaps: number[] =  prioritisedButtonSchenmatics.map((schematic) => schematic.reduce((currentCap, joltageCounter) => Math.min(currentCap, machineInfo.joltageRequirements[joltageCounter]), Number.POSITIVE_INFINITY));
    const topTotalPresses = Math.ceil(machineInfo.joltageRequirements.reduce((accumulator, value) => accumulator + value, 0) / prioritisedButtonSchenmatics[0].length);
    const solution = matrixToButtonPresses(reducedMatrix, buttonPressCaps, topTotalPresses);
    if (solution <= 0){
        throw new Error("no solution found");
    }
    return solution;
}