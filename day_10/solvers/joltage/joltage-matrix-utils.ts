const FLOATING_POINT_ALLOWANCE = 0.0001;

export function findFirstNonzeroInColumn(matrix: number[][], column: number, startingRow: number): number {
    for (let row = startingRow; row < matrix.length; row++){
        if (matrix[row][column]){
            return row;
        }
    }
    return -1;
}

export function roundFloatingPointDriftedInteger(number: number){
    const roundedNumber = Math.round(number);
    return Math.abs(roundedNumber - number) < FLOATING_POINT_ALLOWANCE ? roundedNumber : number
}

export function deepCopyMatrix<Type>(matrix: Type[][]){
    const matrixCopy: Type[][] = [];
    matrix.forEach((row) => matrixCopy.push([...row]));
    return matrixCopy;
}

export function getButtonsInRow(row: number[]): number[]{
    const buttonSlice = row.slice(0, row.length - 1);
    return buttonSlice.reduce(
        (collectorArray, currentValue, index) => 
            currentValue === 0 ? collectorArray : [...collectorArray, index], new Array<number>())
}

export function checkRowHasNegativeCoeficients(row: number[], ignoreColumn = -1){
    const coefficients = row.slice(0, row.length - 1);
    const negativeElement = coefficients.find((element: number, index: number) => 
        element < 0 && (ignoreColumn < 0 || index !== ignoreColumn));
    return typeof negativeElement !== 'undefined';
}

export function checkRowHasPositiveCoeficients(row: number[], ignoreColumn = -1){
    const coefficients = row.slice(0, row.length - 1);
    const positiveElement = coefficients.find((element: number, index: number) => 
        element > 0 && (ignoreColumn < 0 || index !== ignoreColumn));
    return typeof positiveElement !== 'undefined';
}

