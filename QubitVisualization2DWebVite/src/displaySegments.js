import { LineManager } from './LineManager.js';
import { ProbabilityCalculator } from './ProbabilityCalculator.js';

export class DisplaySegments {
  constructor(scene, triangle, labelsContainer, vertexNames) {
    this.scene = scene;
    this.triangle = triangle;
    this.labelsContainer = labelsContainer;
    this.vertexNames = vertexNames;
    this.trianglePoints = triangle.getPositions();
    this.segmentLabels = [];

    this.lineManager = new LineManager(scene);
    this.probabilityCalculator = new ProbabilityCalculator(triangle);

    for (let i = 0; i < 9; i++) {
      const lbl = document.createElement('div');
      lbl.style.position = 'absolute';
      lbl.style.color = '#fff';
      lbl.style.fontFamily = 'monospace';
      lbl.style.userSelect = 'none';
      lbl.style.pointerEvents = 'none';
      labelsContainer.appendChild(lbl);
      this.segmentLabels.push(lbl);
    }
  }

  updateSegments(intersections) {
    this.probabilityCalculator.calculate(intersections);
    this.updateSegmentLabels();
  }

  drawSideSplits(intersections) {
    this.lineManager.clearLines();
    const colors = this.triangle.getColors();

    for (let i = 0; i < 3; i++) {
      const start = this.trianglePoints[i];
      const end = this.trianglePoints[(i + 1) % 3];

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

      for (let j = 0; j + 1 < pointsOnSide.length; j++) {
        const color = colors[(i + 2) % colors.length];
        let finalColor = this.triangle.getColors()[i];
        if (this.trianglePoints[i].distanceTo(pointsOnSide[j]) < this.trianglePoints[(i + 1) % 3].distanceTo(pointsOnSide[j + 1])) {
          finalColor = this.triangle.getColors()[(i + 1) % 3];
        }
        if (j === 1) finalColor = color;

        this.lineManager.createLine(pointsOnSide[j], pointsOnSide[j + 1], finalColor);
      }
    }
  }

  updateSegmentLabels() {
    const probabilities = this.probabilityCalculator.getProbabilities();
    for (let j = 0; j < probabilities.length; j++) {
      document.getElementById("label-" + this.vertexNames[j]).textContent = `${(probabilities[j] * 100).toFixed(1)}%`;
    }
  }

  getProbabilities() {
    return this.probabilityCalculator.getProbabilities();
  }

  resetProbabilities(index) {
    this.probabilityCalculator.resetToSingleIndex(index);
    this.updateSegmentLabels();
  }

  clearSplitLines() {
    this.lineManager.clearLines();
  }
}
