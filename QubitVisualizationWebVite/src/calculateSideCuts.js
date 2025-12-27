// calculateSideCuts.js
import * as THREE from 'three';
import { CalculatePlaneIntersection } from "./calculatePlaneIntersection.js";

class SideCut
{
    constructor(start, end, length, color, label){
        this.start = start;
        this.end = end;
        this.length = length;
        this.color = color;
        this.label = label;
    }
}

class CalculateSideCuts {
  constructor(planeIntersectionCalc, sideLength, colors) {
    this._planeIntersections = planeIntersectionCalc;
    this._sideCuts = [];

    this.sideLength = sideLength;
    this.colors = colors;
  }

  update() {
    this._sideCuts = [];
    const intersections = this._planeIntersections.getFullIntersection();

    for (const intersection of intersections) {
      const { intersection1, intersection2, side } = intersection;

      const v1 = side[0];
      const v2 = side[1];
      const otherColors = this.colors.filter(c =>
            !c.equals(v1.color) && !c.equals(v2.color)
          );


      this._sideCuts.push(this.getSideCut(v1.position, intersection1, v2.color, v2.label));
      this._sideCuts.push(this.getSideCut(v2.position, intersection2, v1.color, v1.label));

      this._sideCuts.push(this.getSideCut(intersection1, intersection2, otherColors, null));
    }
  }

  getSideCut(start, end, color, label){
      const length = start.distanceTo(end) / this.sideLength;
      return new SideCut(start, end, length, color, label);
  }

  getCuts() {
    return this._sideCuts;
  }
}

export { CalculateSideCuts };
