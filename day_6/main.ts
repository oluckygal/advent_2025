import { readFileSync } from 'node:fs';

const NAN_ERROR = "Attempted to add non-number to number list."
const INVALID_OPERATOR_ERROR = "Operator not supported"

class MathProblem {
    readonly numbers: number[] = [];
    readonly operator: string;
    private validOperators: string[] = ["+", "*"];
    constructor(operator: string){
        if (!this.validOperators.includes(operator)){
            throw new Error(INVALID_OPERATOR_ERROR);
        }
        this.operator = operator;
    } 

    addNumber(num: number | string): void{
        if (typeof num === "string"){
            num = parseInt(num, 10)
        }
        if (isNaN(num)){
            throw new Error(NAN_ERROR)
        }
        this.numbers.push(num)
    }

    solve(): number{
        switch(this.operator){
            case "+":
                return this.numbers.reduce((currentTotal: number, num: number) => currentTotal + num, 0)
            case "*":
                return this.numbers.reduce((currentTotal: number, num: number) => currentTotal * num, 1)
            default:
                throw new Error(INVALID_OPERATOR_ERROR)
        }
    }
}

function loadFileAsCharacterArrayLines(path: string): string[][] {
    const lines = readFileSync(path, { encoding: "utf8" }).split("\n")
    return lines.map((line) => line.split(''));
}

function generateCephalopodNumber(charGrid: string[][], columnAddr: number): number | undefined{
    let numberCollector = "";
    for (let j = 0; j < charGrid.length - 1; j++){
        const digit = charGrid[j][columnAddr];
        if (digit !== " "){
            numberCollector = numberCollector.concat(digit);
        }
    }
    if (numberCollector.length === 0){
        return;
    }
    return parseInt(numberCollector, 10);
}

const rawMathProblems : string[][] = loadFileAsCharacterArrayLines("./input.txt");
let sumOfAnswers = 0
let mathProblem: MathProblem | undefined;
for (let i = 0; i < rawMathProblems[0].length; i++){
    const operator: string = rawMathProblems[rawMathProblems.length - 1][i];
    if (operator !== " "){
        if (mathProblem){
            sumOfAnswers += mathProblem.solve()
        }        
        mathProblem = new MathProblem(operator);
    }
    const cephalopodNumber = generateCephalopodNumber(rawMathProblems, i);
    if (typeof cephalopodNumber !== "undefined"){
        mathProblem?.addNumber(cephalopodNumber)
    }
}
sumOfAnswers += mathProblem?.solve() ?? 0
console.log(sumOfAnswers);