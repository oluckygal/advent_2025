import { PilotLightState, MachineInfo } from "../../types/machine-info/machine-info";

type notExhausted = boolean;
type SeenStatesCache = Map<PilotLightState, notExhausted>;

const MAX_PRESSES_ALLOWED = 1000000;

function initializeSeenStatesCache(): SeenStatesCache{
    return new Map<PilotLightState, notExhausted>([[0, true]]);
}

function doButtonPressesForCurrentState(currentState: PilotLightState, machineInfo: MachineInfo, cache: SeenStatesCache): [boolean, Set<PilotLightState>]{
    const newStates: Set<PilotLightState> = new Set<PilotLightState>();
    for (const buttonSchematic of machineInfo.buttonSchematics){
        const newState: PilotLightState = currentState ^ buttonSchematic;
        if (newState === machineInfo.targetState){
            return [true, newStates];
        }
        if (typeof cache.get(newState) === "undefined"){
            newStates.add(newState);
        }
    }
    return [false, newStates];
}

export function targetStatePressesSolver(machineInfo: MachineInfo): number {
    if (machineInfo.targetState === 0){
        return 0;
    }
    const seenStatesCache: SeenStatesCache = initializeSeenStatesCache();
    let buttonPresses = 1;
    for (buttonPresses = 1; buttonPresses <= MAX_PRESSES_ALLOWED; buttonPresses++){
        let allNewStates: Set<number> = new Set<number>();
        for (const currentState of seenStatesCache.keys()){
            if (!seenStatesCache.get(currentState)){
                continue;
            }
            const [foundMatch, newStates]: [boolean, Set<number>] = doButtonPressesForCurrentState(currentState, machineInfo, seenStatesCache);
            if (foundMatch){
                return buttonPresses;
            }
            if (newStates.size === 0){
                seenStatesCache.set(currentState, false);
            } else {
                allNewStates = new Set([...allNewStates, ...newStates])
            }
        }
        allNewStates.forEach((state: PilotLightState) => seenStatesCache.set(state, true));
    }
    throw new Error("Exceeded maximum button presses");
}