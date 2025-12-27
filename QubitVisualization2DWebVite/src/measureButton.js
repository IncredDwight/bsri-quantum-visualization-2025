import * as THREE from 'three';

export class MeasureButton {
  constructor(buttonElement, clampedTrianglePoints, updateVisualization, circleGroup, displaySegments) {
    this.buttonElement = buttonElement;
    this.clampedTrianglePoints = clampedTrianglePoints;
    this.updateVisualization = updateVisualization;
    this.circleGroup = circleGroup;
    this.displaySegments = displaySegments;

    this.attachListener();
  }

  attachListener() {
    this.buttonElement.addEventListener("click", () => {
      const index = this.choose(this.displaySegments.probabilityCalculator.getProbabilities());
      const chosenPoint = this.clampedTrianglePoints[index].clone();

      this.updateVisualization(new THREE.Vector3(chosenPoint.x, chosenPoint.y, 0));
      this.circleGroup.position.set(chosenPoint.x, chosenPoint.y, 0);

      this.displaySegments.probabilityCalculator.reset(index);
    });
  }

  choose(probabilities, outcomes = [0, 1, 2]) {
    const rand = Math.random();
    let cumulative = 0;
    for (let i = 0; i < probabilities.length; i++) {
      cumulative += probabilities[i];
      if (rand < cumulative) return outcomes[i];
    }
    return outcomes[outcomes.length - 1];
  }
}
