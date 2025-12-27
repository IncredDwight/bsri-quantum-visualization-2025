import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';

export class DisplayRadius {
  constructor(scene, center, scale, color = "#ff00ff") {
    this.scene = scene;
    this.center = center;
    this.scale = scale;
    this.line = null;

    this.resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);

    document.getElementById('label-R').style.color = color;
  }

  draw(point) {
    this.clear();

    const geometry = new LineGeometry();
    geometry.setPositions([this.center.x, this.center.y, 0, point.x, point.y, 0]);

    const material = new LineMaterial({
      color: 0xff00ff,
      linewidth: 5,
      resolution: this.resolution,
      dashed: false,
      depthTest: false,
    });

    this.line = new Line2(geometry, material);
    this.line.computeLineDistances();
    this.line.renderOrder = 10;

    this.scene.add(this.line);

    const distance = this.center.distanceTo(point) / this.scale;
    document.getElementById("label-R").textContent = distance.toFixed(2);
  }

  clear() {
    if (this.line) {
      this.scene.remove(this.line);
      this.line.geometry.dispose();
      this.line.material.dispose();
      this.line = null;
    }
  }
}
