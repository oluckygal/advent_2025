import { readFileSync } from 'node:fs';

type State = string;
type StateTransitionMap = Map<State, State[]>

interface PathNode {
    state: State
    nextStates: State[]
    routesWhenSeen: number
}

function loadFileAsLines(path: string): string[] {
    return readFileSync(path, { encoding: "utf8" }).split("\n");
}

function stateStringsToMap(stateStrings: string[]): StateTransitionMap{
    const stateTransitionMap: StateTransitionMap = new Map<State, State[]>();
    for (const stateString of stateStrings){
        const [currentState, nextStatesString] = stateString.split(":");
        const nextStates: string[] = nextStatesString.trim().split(' ');
        stateTransitionMap.set(currentState, nextStates);
    }
    return stateTransitionMap;
}

function countPaths(stateTransitionMap: StateTransitionMap, start: State, end: State): number{
    const pathQueue: PathNode[] = [];
    pathQueue.push({state: start, nextStates: [...(stateTransitionMap.get(start) ?? [])], routesWhenSeen: 0});
    const completedStates: Map<State, number> = new Map<State, number>();
    let routeCounter = 0;
    while (pathQueue.length > 0) {

        const currentNode: PathNode | undefined = pathQueue.pop();
        if (typeof currentNode === "undefined"){
            throw new Error("Queue emptied without loop terminating")
        }
        const cachedStatePaths: number | undefined = completedStates.get(currentNode.state);
        if (typeof cachedStatePaths !== 'undefined'){
            routeCounter += cachedStatePaths;
            continue;
        }
        if (currentNode.nextStates.length === 0){
            completedStates.set(currentNode.state, routeCounter - currentNode.routesWhenSeen);
            continue;
        }
        const nextState: State | undefined = currentNode.nextStates.pop();
        if (typeof nextState === "undefined"){
            throw new Error("Non-terminal state has no next state");
        }
        pathQueue.push(currentNode);
        if (nextState === end){
            routeCounter++;
            continue;
        }
        pathQueue.push({state: nextState, nextStates: [...(stateTransitionMap.get(nextState) ?? [])], routesWhenSeen: routeCounter})
    }
    return routeCounter;
}

function safeAddToSubmap<OuterKeyType, InnerKeyType, ValueType>(map: Map<OuterKeyType, Map<InnerKeyType, ValueType>>, outerKey: OuterKeyType, innerKey: InnerKeyType, value: ValueType){
    const outerMap: Map<OuterKeyType, Map<InnerKeyType, ValueType>> = structuredClone(map);
    let innerMap: Map<InnerKeyType, ValueType> | undefined = outerMap.get(outerKey);
    if (typeof innerMap === 'undefined'){
        innerMap = new Map<InnerKeyType, ValueType>();
    }
    innerMap.set(innerKey, value);
    outerMap.set(outerKey, innerMap);
    return outerMap;
}

function safeGetFromSubmap<OuterKeyType, InnerKeyType, ValueType>(map: Map<OuterKeyType, Map<InnerKeyType, ValueType>>, outerKey: OuterKeyType, innerKey: InnerKeyType): ValueType | undefined{
    const innerMap: Map<InnerKeyType, ValueType> | undefined = map.get(outerKey);
    if (typeof innerMap === 'undefined'){
        return;
    }
    return innerMap.get(innerKey);
}

function createCachingPathComparator(stateTransitionMap: StateTransitionMap, cachingFunction: (state1: State, state2: State, value: number) => void): (state1: State, state2: State) => number {
    return (state1: State, state2: State) => {
        const subpathCount: number = countPaths(stateTransitionMap, state1, state2);
        if (subpathCount === 0){
            return 1;
        }
        cachingFunction(state1, state2, subpathCount)
        return -1;
    }
}

function countPathsThrough(stateTransitionMap: StateTransitionMap, start: State, end: State, through: State[]): number{
    let pathCountCache: Map<State, Map<State, number>> = new Map<State, Map<State, number>>();
    const cachingFunction = (state1: State, state2: State, value: number) => {
        pathCountCache = safeAddToSubmap(pathCountCache, state1, state2, value)
    }
    const subpathComparator = createCachingPathComparator(stateTransitionMap, cachingFunction)
    const pathOrder = [...through].sort(subpathComparator);
    let totalPaths = countPaths(stateTransitionMap, start, pathOrder[0]);
    for (let i = 0; i < pathOrder.length - 1; i++){
        totalPaths *= (safeGetFromSubmap(pathCountCache, pathOrder[i], pathOrder[i+1]) ?? countPaths(stateTransitionMap, pathOrder[i], pathOrder[i+1])); 
    }
    totalPaths *= countPaths(stateTransitionMap, pathOrder[pathOrder.length - 1], end);
    return totalPaths;
}

const rawAutomataInfo: string[] = loadFileAsLines("./input.txt");
const stateTransitionMap: StateTransitionMap = stateStringsToMap(rawAutomataInfo);

console.log(countPaths(stateTransitionMap, "you", "out"));
console.log(countPathsThrough(stateTransitionMap, "svr", "out", ["dac", "fft"]));