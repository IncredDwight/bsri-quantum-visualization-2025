import * as THREE from 'three';
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { CalculateInBetweenPlaneIntersection } from './calculatePlaneInBetweenIntersection.js';

class IntersectionView {
  constructor(visualization3D, planesGenerator, calculateSide, scene, options = {}) {
    this.scene = scene;
    this.visualization3D = visualization3D;
    this.planesGenerator = planesGenerator;

    this.materialColor = options.color || new THREE.Color(0xffffff);
    this.lineThickness = options.thickness || 2.0;

    this.lineSegments = [];

    this.calculator = new CalculateInBetweenPlaneIntersection(
      this.visualization3D,
      this.planesGenerator
    );

    window.addEventListener('resize', () => this._onResize());
  }

  update() {
    this.calculator.update();
    const pairsToDraw = this.calculator.getPairs();

    // Convert raw line data to segment objects
    const rawSegments = pairsToDraw.map(([p1, p2]) => ({
      start: { x: p1.x, y: p1.y, z: p1.z },
      end: { x: p2.x, y: p2.y, z: p2.z }
    }));

    // Split all line segments at intersections
    const splitSegments = this.splitLineSegments(rawSegments);

    // Create enough line objects
    this._ensureLineCount(splitSegments.length);

    for (let i = 0; i < splitSegments.length; i++) {
      const seg = splitSegments[i];
      this._updateLineGeometry(this.lineSegments[i], seg.start, seg.end);
      this.lineSegments[i].visible = true;
    }

    // Hide unused line objects
    for (let i = splitSegments.length; i < this.lineSegments.length; i++) {
      this.lineSegments[i].visible = false;
    }
  }

  splitLineSegments(lineSegments) {
    const newSegments = [];
    const epsilon = 1e-6;

    function getIntersection3D(a1, a2, b1, b2) {
      const p1 = new THREE.Vector3(a1.x, a1.y, a1.z);
      const p2 = new THREE.Vector3(a2.x, a2.y, a2.z);
      const q1 = new THREE.Vector3(b1.x, b1.y, b1.z);
      const q2 = new THREE.Vector3(b2.x, b2.y, b2.z);

      const u = new THREE.Vector3().subVectors(p2, p1);
      const v = new THREE.Vector3().subVectors(q2, q1);
      const w0 = new THREE.Vector3().subVectors(p1, q1);

      const a = u.dot(u);
      const b = u.dot(v);
      const c = v.dot(v);
      const d = u.dot(w0);
      const e = v.dot(w0);

      const denom = a * c - b * b;

      // Parallel or nearly parallel
      if (Math.abs(denom) < epsilon) return null;

      let s = (b * e - c * d) / denom;
      let t = (a * e - b * d) / denom;

      // Clamp s, t to [0, 1] to stay within segments
      s = Math.max(0, Math.min(1, s));
      t = Math.max(0, Math.min(1, t));

      const cp1 = new THREE.Vector3().addVectors(p1, u.clone().multiplyScalar(s));
      const cp2 = new THREE.Vector3().addVectors(q1, v.clone().multiplyScalar(t));

      const dist = cp1.distanceTo(cp2);

      if (dist < epsilon) {
        // Return middle point
        return {
          x: (cp1.x + cp2.x) / 2,
          y: (cp1.y + cp2.y) / 2,
          z: (cp1.z + cp2.z) / 2
        };
      }

      return null;
    }

    for (let i = 0; i < lineSegments.length; i++) {
      const seg = lineSegments[i];
      let points = [seg.start, seg.end];

      for (let j = 0; j < lineSegments.length; j++) {
        if (i === j) continue;
        const other = lineSegments[j];
        const p = getIntersection3D(seg.start, seg.end, other.start, other.end);
        if (p) {
          points.push(p);
        }
      }

      // Remove duplicates
      points = points.filter((value, index, self) =>
        index === self.findIndex(p =>
          Math.abs(p.x - value.x) < epsilon &&
          Math.abs(p.y - value.y) < epsilon &&
          Math.abs(p.z - value.z) < epsilon
        )
      );

      // Sort points along segment
      points.sort((p1, p2) => {
        const d1 = (p1.x - seg.start.x) ** 2 + (p1.y - seg.start.y) ** 2 + (p1.z - seg.start.z) ** 2;
        const d2 = (p2.x - seg.start.x) ** 2 + (p2.y - seg.start.y) ** 2 + (p2.z - seg.start.z) ** 2;
        return d1 - d2;
      });

      for (let k = 0; k < points.length - 1; k++) {
        const p1 = points[k];
        const p2 = points[k + 1];
        if (Math.abs(p1.x - p2.x) > epsilon || Math.abs(p1.y - p2.y) > epsilon || Math.abs(p1.z - p2.z) > epsilon) {
          newSegments.push({ start: p1, end: p2 });
        }
      }
    }

    return newSegments;
  }

  _ensureLineCount(count) {
    let i = this.lineSegments.length;
    while (this.lineSegments.length < count) {
      const line = this._createLine(i);
      this.scene.add(line);
      this.lineSegments.push(line);
      i++;
    }
  }

  _createLine(index) {
    const geometry = new LineGeometry();
    geometry.setPositions([0, 0, 0, 0, 0, 0]);
    const red = new THREE.Color(0xFF0000);
    const blue = new THREE.Color(0x0000FF);
    const pink = new THREE.Color(0xFFA500);
    const orange = new THREE.Color(0xCCFF00);
    const colors = [new THREE.Color(0xFF0000), new THREE.Color(0x0000FF), new THREE.Color(0xFFFF00), new THREE.Color(0xFFA500)]
    this.materialColor = pink;
    const indexToColor = {
        0: orange, 5: orange, 11: orange, 12: orange, 18: orange, 23: orange,
        3: red, 8: red, 20: red, 24: red, 29: red, 33: red,
        14: pink, 17: pink, 21: pink, 26: pink, 30: pink, 35: pink,
        2: blue, 6: blue, 9: blue, 15: blue, 27: blue, 32: blue,
    };
    this.materialColor = indexToColor[index] || new THREE.Color(0xFFFFFF)

    //
    const material = new LineMaterial({
      color: this.materialColor.getHex(),
      linewidth: this.lineThickness,
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
    });

    const line = new Line2(geometry, material);
    line.computeLineDistances();
    line.frustumCulled = false;
    return line;
  }

  _updateLineGeometry(line, start, end) {
    line.geometry.setPositions([
      start.x, start.y, start.z,
      end.x, end.y, end.z
    ]);
    line.geometry.needsUpdate = true;
    line.computeLineDistances();
  }

  _onResize() {
    const resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
    for (const line of this.lineSegments) {
      line.material.resolution.copy(resolution);
    }
  }

  getIntersectionAxis() {
    return this.calculator.getIntersectionAxis();
  }

  disable() {
    for (const line of this.lineSegments) {
      line.visible = false;
    }
  }

  enable() {
    for (const line of this.lineSegments) {
      line.visible = true;
    }
  }
}

export { IntersectionView };