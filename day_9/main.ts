import { readFileSync } from 'node:fs';

enum Dimensions {
    X = "x",
    Y = "y"
}

type Coordinate2D = Record<Dimensions, number>

interface Rectangle {
    readonly corners: [Coordinate2D, Coordinate2D],
    readonly area: number
}

class AxisParallelLineSegment {
    readonly constantDimension: Dimensions;
    readonly constantValue: number;
    readonly start: number;
    readonly end: number;

    constructor(coordinate1: Coordinate2D, coordinate2: Coordinate2D){
        if (coordinate1[Dimensions.X] === coordinate2[Dimensions.X]){
            this.constantDimension = Dimensions.X
            this.constantValue = coordinate1[Dimensions.X]
            this.start = coordinate1[Dimensions.Y] 
            this.end = coordinate2[Dimensions.Y]
            return;
        } 
        this.constantDimension = Dimensions.Y 
        this.constantValue = coordinate1[Dimensions.Y]
        this.start = coordinate1[Dimensions.X] 
        this.end = coordinate2[Dimensions.X]
    }
}

function loadFileAsLines(path: string): string[] {
    return readFileSync(path, { encoding: "utf8" }).split("\n");
}

function loadFileAs2dCoordinates(path: string): Coordinate2D[] {
    const fileLines = loadFileAsLines(path);
    return fileLines.map(stringTo2dCoordinate);
}

function stringTo2dCoordinate(coordinateString: string): Coordinate2D{
    const parsedString: number[] = coordinateString.split(',').map((coordinateNumberString) => parseInt(coordinateNumberString, 10));
    return {x: parsedString[0], y: parsedString[1]};
}

function calculateRectangleArea(corner1: Coordinate2D, corner2: Coordinate2D) {
    return (Math.abs(corner1.x - corner2.x) + 1) * (Math.abs(corner1.y - corner2.y) + 1);
}

function createRectanglesFromCorners(corners: Coordinate2D[]): Rectangle[]{
    const rectangles: Rectangle[] = [];
    for (let i = 0; i < corners.length - 1; i++){
        for (let j = i + 1; j < corners.length; j++){
            rectangles.push({corners: [corners[i], corners[j]], area: calculateRectangleArea(tileCoordinates[i], tileCoordinates[j])});
        }
    }
    return rectangles;
}

function doesLineSegmentCutRectangle(rectangle: Rectangle, lineSegment: AxisParallelLineSegment){
    const otherDimensionMap: Record<Dimensions, Dimensions> = {[Dimensions.X]: Dimensions.Y, [Dimensions.Y]: Dimensions.X};
    const constantDimension = lineSegment.constantDimension;
    const otherDimension: keyof Coordinate2D = otherDimensionMap[constantDimension];
    const maxCornerInConstantDimension = Math.max(rectangle.corners[0][constantDimension], rectangle.corners[1][constantDimension]);
    const minCornerInConstantDimension = Math.min(rectangle.corners[0][constantDimension], rectangle.corners[1][constantDimension]);

    if (lineSegment.constantValue <= minCornerInConstantDimension || lineSegment.constantValue >= maxCornerInConstantDimension){
        return false;
    }

    const maxCornerInVariableDimension = Math.max(rectangle.corners[0][otherDimension], rectangle.corners[1][otherDimension]);
    const minCornerInVariableDimension = Math.min(rectangle.corners[0][otherDimension], rectangle.corners[1][otherDimension]);
    const minLine = Math.min(lineSegment.start, lineSegment.end);
    const maxLine = Math.max(lineSegment.start, lineSegment.end);

    if (minLine >= maxCornerInVariableDimension || maxLine <= minCornerInVariableDimension){
        return false;
    }
    return true;
}

function getBiggestRedGreenRectangle(rectangles: Rectangle[], lineSegments: AxisParallelLineSegment[]): Rectangle | undefined{
    rectangles.sort((rectangle1, rectangle2) => rectangle2.area - rectangle1.area);
    for (const rectangle of rectangles){
        let isAllRedOrGreen = true;
        for (const lineSegment of lineSegments){
            if (doesLineSegmentCutRectangle(rectangle, lineSegment)){
                isAllRedOrGreen = false;
                break;
            }
        }
        if (isAllRedOrGreen){
            return rectangle;
        }
    }
}

function generateAdjacentLineSegments(coordinates: Coordinate2D[]): AxisParallelLineSegment[]{
    const lineSegments: AxisParallelLineSegment[] = []
    for (let i = 0; i < coordinates.length - 1; i++){
        lineSegments.push(new AxisParallelLineSegment(coordinates[i], coordinates[i + 1]));
    }
    lineSegments.push(new AxisParallelLineSegment(coordinates[coordinates.length - 1], coordinates[0]));
    return lineSegments;
}

const tileCoordinates: Coordinate2D[] = loadFileAs2dCoordinates('./input.txt');
const rectangles: Rectangle[] = createRectanglesFromCorners(tileCoordinates);
const lineSegments: AxisParallelLineSegment[] = generateAdjacentLineSegments(tileCoordinates);
rectangles.sort((rectangle1, rectangle2) => rectangle2.area - rectangle1.area);
console.log(rectangles[0].area);
console.log(JSON.stringify(getBiggestRedGreenRectangle(rectangles, lineSegments)));
