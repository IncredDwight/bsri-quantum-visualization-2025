export class ProbabilityCalculator {
  constructor(triangle) {
    this.triangle = triangle;
    this.trianglePoints = triangle.getPositions();
    this.probabilities = [0.33, 0.33, 0.33];
  }

  calculate(intersections) {
    const trianglePoints = this.trianglePoints;
    const newProbabilities = [];

    for (let i = 0; i < 3; i++) {
      const start = trianglePoints[i];
      const end = trianglePoints[(i + 1) % 3];

      const pointsOnSide = intersections.filter(p => {
        const toP = p.clone().sub(start);
        const edgeVec = end.clone().sub(start);
        const proj = toP.dot(edgeVec) / edgeVec.lengthSq();
        const closest = start.clone().add(edgeVec.clone().multiplyScalar(proj));
        return proj >= 0 && proj <= 1 && p.distanceTo(closest) < 1e-3;
      });

      pointsOnSide.push(start.clone(), end.clone());
      pointsOnSide.sort((p1, p2) =>
        p1.clone().sub(start).dot(end.clone().sub(start)) -
        p2.clone().sub(start).dot(end.clone().sub(start))
      );

      let totalLength = 0;
      const segmentLengths = [];
      for (let j = 0; j + 1 < pointsOnSide.length; j++) {
        const length = pointsOnSide[j].distanceTo(pointsOnSide[j + 1]);
        segmentLengths.push(length);
        totalLength += length;
      }

      for (let j = 0; j < segmentLengths.length; j++) {
        newProbabilities[j] = segmentLengths[j] / totalLength;
      }
    }

    this.probabilities = newProbabilities;
  }

  getProbabilities() {
    return this.probabilities;
  }

  reset(index) {
    this.probabilities = [0, 0, 0];
    this.probabilities[index] = 1;
  }
}
