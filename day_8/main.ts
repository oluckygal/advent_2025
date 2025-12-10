import { readFileSync } from 'node:fs';

type ID = number;
type CircuitID = number;
type Distance = number;

interface Coordinate3D {
    readonly x: number,
    readonly y: number,
    readonly z: number
}

interface JunctionBox extends Coordinate3D {
    readonly id: ID
}

interface DistanceInfo {
    readonly distance: Distance
    readonly ids: [ID, ID]
}

interface Circuit {
    id: CircuitID
    members: ID[]
}

interface ConnectionInfo {
    circuitMap: CircuitMap
    nextCircuitId: CircuitID,
    connectedCircuit: Circuit
}

type CircuitMap = Map<ID, Circuit>;

function loadFileAsLines(path: string): string[] {
    return readFileSync(path, { encoding: "utf8" }).split("\n");
}

function loadFileAs3dCoordinates(path: string): Coordinate3D[] {
    const fileLines = loadFileAsLines(path);
    return fileLines.map(stringTo3dCoordinate);
}

function stringTo3dCoordinate(coordinateString: string): Coordinate3D{
    const parsedString: number[] = coordinateString.split(',').map((coordinateNumberString) => parseInt(coordinateNumberString, 10));
    return {x: parsedString[0], y: parsedString[1], z: parsedString[2]};
}

function coordinateToJunctionBox(coordinate: Coordinate3D, id: number): JunctionBox {
    return {...coordinate, id};
}

function calculate3dDistance(coordinate1: Coordinate3D, coordinate2: Coordinate3D): Distance{
    return ((coordinate1.x - coordinate2.x) ** 2 + (coordinate1.y - coordinate2.y) ** 2 + (coordinate1.z - coordinate2.z) ** 2) ** 0.5;
}

function getAllJunctionDistances(junctions: JunctionBox[]): DistanceInfo[]{
    const distances: DistanceInfo[] = []
    for (let i = 0; i < junctions.length - 1; i++){
        for (let j = i + 1; j < junctions.length; j++){
            const box1: JunctionBox = junctions[i];
            const box2: JunctionBox = junctions[j];
            const distance: Distance = calculate3dDistance(junctions[i], junctions[j])
            distances.push({ids: [box1.id, box2.id], distance})
        }
    }
    return distances;
}

function getCurrentCircuit(circuit1: Circuit | undefined, circuit2: Circuit | undefined, connection: DistanceInfo, newCircuitId: number): Circuit{
    return circuit1 ?? circuit2 ?? {id: newCircuitId, members: [connection.ids[0], connection.ids[1]]}
}

function makeConnction(distance: DistanceInfo, circuitMap: CircuitMap, nextCircuitId: number): ConnectionInfo{
    const id1: ID = distance.ids[0]
    const id2: ID = distance.ids[1]
    const circuit1: Circuit | undefined = circuitMap.get(id1);
    const circuit2: Circuit | undefined = circuitMap.get(id2);
    const connectedCircuit: Circuit = getCurrentCircuit(circuit1, circuit2, distance, nextCircuitId);
    if (typeof circuit1 === "undefined"){
        if (typeof circuit2 === "undefined"){
            nextCircuitId++;
        } else {
            connectedCircuit.members.push(id1)
        }
    } else if (typeof circuit2 === "undefined"){
        connectedCircuit.members.push(id2)
    } else if (circuit1.id === circuit2.id){
        return {circuitMap, nextCircuitId, connectedCircuit};
    } else {
        connectedCircuit.members = connectedCircuit.members.concat(circuit2.members)
    }
    for (const member of connectedCircuit.members){
        circuitMap.set(member, connectedCircuit)
    }
    return {circuitMap, nextCircuitId, connectedCircuit};
}

function generateCircuitsByNumberOfConnections(distances: DistanceInfo[], numOfConnections: number): [CircuitMap, DistanceInfo]{
    distances.sort((distanceInfo1, distanceInfo2) => distanceInfo1.distance - distanceInfo2.distance);
    let circuitMap: CircuitMap = new Map<ID, Circuit>();
    let nextCircuitId = 0;
    let lastConnection = distances[0];
    for (let i = 0; i < numOfConnections; i++){
        const connectionInfo: ConnectionInfo = makeConnction(distances[i], circuitMap, nextCircuitId) 
        circuitMap = connectionInfo.circuitMap;
        nextCircuitId = connectionInfo.nextCircuitId
        lastConnection = distances[i];
    }
    return [circuitMap, lastConnection];
}

function generateCircuitsByLastConnectionInfo(distances: DistanceInfo[], untilCircuitPredicate: (circuit: Circuit) => boolean): [CircuitMap, DistanceInfo]{
    distances.sort((distanceInfo1, distanceInfo2) => distanceInfo1.distance - distanceInfo2.distance);
    let circuitMap: CircuitMap = new Map<ID, Circuit>();
    let nextCircuitId = 0;
    let lastCircuit: Circuit | undefined
    let i = 0;
    let lastConnection = distances[0];
    do {
        const connectionInfo: ConnectionInfo = makeConnction(distances[i], circuitMap, nextCircuitId) 
        circuitMap = connectionInfo.circuitMap;
        nextCircuitId = connectionInfo.nextCircuitId;
        lastCircuit = connectionInfo.connectedCircuit;
        lastConnection = distances[i]
        i++;
    } while (typeof lastCircuit !== "undefined" && !untilCircuitPredicate(lastCircuit))
    return [circuitMap, lastConnection];
}

function getCircuitLengths(circuitMap: CircuitMap): number[]{
    const circuitCount: Map<ID, number> = new Map<ID, number>();
    circuitMap.forEach((circuit) => {
        circuitCount.set(circuit.id, (circuitCount.get(circuit.id) ?? 0) + 1);
    })
    return Array.from(circuitCount.values());
}

const coordinates: Coordinate3D[] = loadFileAs3dCoordinates('./input.txt');
const junctionBoxes: JunctionBox[] = coordinates.map(coordinateToJunctionBox);
const distances: DistanceInfo[] = getAllJunctionDistances(junctionBoxes);

const [circuitMap,] = generateCircuitsByNumberOfConnections(distances, 1000);
const circuitLengths: number[] = getCircuitLengths(circuitMap);
circuitLengths.sort((num1, num2) => num2 - num1);
console.log(circuitLengths[0] * circuitLengths[1] * circuitLengths[2]);

const [, lastConnection] = generateCircuitsByLastConnectionInfo(distances, (circuit: Circuit) => circuit.members.length === junctionBoxes.length);
const lastBoxes: JunctionBox[] = [junctionBoxes[lastConnection.ids[0]], junctionBoxes[lastConnection.ids[1]]];
console.log(lastBoxes[0].x * lastBoxes[1].x)