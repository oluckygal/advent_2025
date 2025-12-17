import { deepCopyMatrix, roundFloatingPointDriftedInteger, findFirstNonzeroInColumn } from "./joltage-matrix-utils";

export function machineInfoToButtonJoltageMatrix(joltageRequirements: number[], buttonSchematics: number[][]): number[][]{
    const joltageMatrix: number[][] = [];
    for (let i = 0; i < joltageRequirements.length; i++){
        const row = [];
        for (const button of buttonSchematics){
            row.push(button.includes(i) ? 1 : 0);
        }
        row.push(joltageRequirements[i]);
        joltageMatrix.push(row);
    }
    return joltageMatrix;
}

function convertJoltageMatrixToRowEchelon(joltageMatrix: number[][]): number[][]{
    const echelonMatrix: number[][] = deepCopyMatrix(joltageMatrix);
    let columnBuffer = 0;
    for (let i = 0; i + columnBuffer < echelonMatrix[0].length && i < echelonMatrix.length; i++){
        if (echelonMatrix[i][i + columnBuffer] === 0){
            const nonzeroRow: number = findFirstNonzeroInColumn(echelonMatrix, i + columnBuffer, i + 1);
            if (nonzeroRow === -1){
                columnBuffer++;
                i--;
                continue;
            }
            [echelonMatrix[nonzeroRow], echelonMatrix[i]] = [echelonMatrix[i], echelonMatrix[nonzeroRow]];
        }
        echelonMatrix[i] = echelonMatrix[i].map((entry) => roundFloatingPointDriftedInteger(entry * (1 / echelonMatrix[i][i + columnBuffer])));
        for (let j = i + 1; j < echelonMatrix.length; j++){
            if (echelonMatrix[j][i + columnBuffer] === 0){
                continue;
            }
            echelonMatrix[j] = echelonMatrix[j].map((entry, index) => roundFloatingPointDriftedInteger(entry - echelonMatrix[i][index] * echelonMatrix[j][i + columnBuffer]));
        }
    }
    return echelonMatrix;
}

function reduceRowEchelonMatrix(matrix: number[][]){
    const reducedMatrix = deepCopyMatrix(matrix);
    for (let i = reducedMatrix.length - 1; i > 0; i--){
        const reducingColumn: number = reducedMatrix[i].findIndex((value) => value === 1);
        if (reducingColumn < 0 || reducingColumn === reducedMatrix[i].length - 1){
            continue;
        }
        for (let j = i - 1; j >= 0; j--){
            if (reducedMatrix[j][reducingColumn] === 0){
                continue;
            }
            reducedMatrix[j] = reducedMatrix[j].map((entry, index) => roundFloatingPointDriftedInteger(entry - reducedMatrix[i][index] * reducedMatrix[j][reducingColumn]));
        }
    }
    return reducedMatrix;
}

export function convertJoltageMatrixToReducedRowEchelon(joltageMatrix: number[][]){
    const rowEchelonMatrix: number[][] = convertJoltageMatrixToRowEchelon(joltageMatrix);
    return reduceRowEchelonMatrix(rowEchelonMatrix);
}