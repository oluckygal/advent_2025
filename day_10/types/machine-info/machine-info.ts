export type PilotLightState = number;
export type ButtonSchematic = number;
export type JoltageRequirements = number[];

export interface MachineInfo {
    targetState: PilotLightState,
    buttonSchematics: ButtonSchematic[],
    arrayButtonSchematics: number[][],
    joltageRequirements: JoltageRequirements
}

export const LIGHT_ON_CHARACTER = "#";

function makePilotLightStateFromString(rawState: string): PilotLightState {
    const bracketlessState: string = rawState.substring(1, rawState.length - 1);
    let state: PilotLightState = 0;
    for (let i = 0; i < bracketlessState.length; i++){
        if (bracketlessState.charAt(i) === LIGHT_ON_CHARACTER){
            state += (2 ** i);
        }
    }
    return state;
}

function makeNumberArrayFromBracketedString(bracketedNumberList: string): number[]{
    const rawNumbers = bracketedNumberList.substring(1, bracketedNumberList.length - 1).split(",");
    return rawNumbers.map((rawNumber) => parseInt(rawNumber, 10))
}

function numberArrayToBitswapNumber(numberArray: number[]): number{
    return numberArray.reduce((bitswapNumber, arrayNumber) => bitswapNumber + 2 ** arrayNumber, 0);
}

function getButtonSchematicsFromStrings(strings: string[]): [ButtonSchematic[], number[][]]{
    const buttonSchematics: ButtonSchematic[] = [];
    const arrayStyleSchematics: number[][] = [];
    for (const rawButtonSchematic of strings){
        const arrayStyleSchematic: number[] = makeNumberArrayFromBracketedString(rawButtonSchematic);
        arrayStyleSchematics.push(arrayStyleSchematic);
        buttonSchematics.push(numberArrayToBitswapNumber(arrayStyleSchematic));
    }
    return [buttonSchematics, arrayStyleSchematics];
}

export function parseMachineInfo(rawMachineInfo: string): MachineInfo {
    const splitString: string[] = rawMachineInfo.split(" ");
    const targetState: PilotLightState = makePilotLightStateFromString(splitString[0])
    
    const [buttonSchematics, arrayButtonSchematics]:[ButtonSchematic[], number[][]] = getButtonSchematicsFromStrings(splitString.slice(1, -1));

    const joltageRequirements: JoltageRequirements = makeNumberArrayFromBracketedString(splitString[splitString.length - 1]);
    return {targetState, buttonSchematics, joltageRequirements, arrayButtonSchematics};
}