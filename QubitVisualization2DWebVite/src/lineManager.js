import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';

export class LineManager {
  constructor(scene) {
    this.scene = scene;
    this.lines = [];
    this.resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
  }

  createLine(p1, p2, color = 0x000000, width = 5, options = {}) {
    const geometry = new LineGeometry();
    geometry.setPositions([p1.x, p1.y, 0, p2.x, p2.y, 0]);

    const material = new LineMaterial({
      color,
      linewidth: width,
      resolution: this.resolution,
      dashed: false,
      ...options.materialOptions,
    });

    const line = new Line2(geometry, material);
    line.computeLineDistances();

    if (options.depthTest === false) {
      line.renderOrder = 10;
      material.depthTest = false;
    }

    this.scene.add(line);
    this.lines.push(line);
    return line;
  }

  clearLines() {
    this.lines.forEach(line => {
      this.scene.remove(line);
      line.geometry?.dispose();
      line.material?.dispose();
    });
    this.lines = [];
  }

  getLines() {
    return this.lines;
  }
}
