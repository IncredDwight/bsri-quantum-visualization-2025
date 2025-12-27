import * as THREE from 'three';
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";

class AxisDisplay {
  constructor(scene, pointObject, directions, tetrahedronMesh, length = 50) {
    this.scene = scene;
    this.pointObject = pointObject;
    this.directions = directions;
    this.tetrahedronMesh = tetrahedronMesh;
    this.length = length;

    this.lines = [];
    this.spheres = [];
    this.segmentVectors = [];

    this.axisColors = [
      0xff0000, // AD - red
      0x00ff00, // AB - green
      0x0000ff  // CD - blue
    ];

    this.sphereGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    this.enabled = true;
  }

  drawAxes() {
    this.clearVisuals();       // Clear previous visuals
    this.segmentVectors = [];  // Clear raw data

    const center = new THREE.Vector3();
    this.pointObject.getWorldPosition(center);

    const tetraGeometry = this.tetrahedronMesh.geometry.clone();
    tetraGeometry.applyMatrix4(this.tetrahedronMesh.matrixWorld);
    for (let i = 0; i < this.directions.length; i++) {
      const dir = this.directions[i];
      if (!dir || !(dir instanceof THREE.Vector3)) continue;

      const safeDir = dir.clone().normalize();
      if (!isFinite(safeDir.length())) continue;

      const ray = new THREE.Ray(center, safeDir);
      const rayNeg = new THREE.Ray(center, safeDir.clone().negate());
      const intersect = this._rayIntersectTetrahedron(ray, tetraGeometry);
      const intersectNeg = this._rayIntersectTetrahedron(rayNeg, tetraGeometry);

      if (intersect && intersectNeg) {
        const start = intersectNeg.clone();
        const end = intersect.clone();
        this.segmentVectors.push([start, end]);

        if (!this.enabled) continue; // Skip visuals if disabled

        const positions = [start.x, start.y, start.z, end.x, end.y, end.z];
        const colorHex = this.axisColors[i] ?? 0xffff00;

        const geometry = new LineGeometry();
        geometry.setPositions(positions);

        const material = new LineMaterial({
          color: colorHex,
          linewidth: 5,
          resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
        });

        const line = new Line2(geometry, material);
        line.computeLineDistances();
        line.frustumCulled = false;
        this.scene.add(line);
        this.lines.push(line);

        const sphereMaterial = new THREE.MeshBasicMaterial({ color: colorHex });
        const sphere = new THREE.Mesh(this.sphereGeometry, sphereMaterial);
        sphere.position.copy(center);
        this.scene.add(sphere);
        this.spheres.push(sphere);
      }
    }
  }

  _rayIntersectTetrahedron(ray, geometry) {
    const pos = geometry.attributes.position;
    const index = geometry.index;

    if (!index) return null;

    const vertices = [];
    for (let i = 0; i < pos.count; i++) {
      vertices.push(new THREE.Vector3().fromBufferAttribute(pos, i));
    }

    let closest = null;
    let minDist = Infinity;

    for (let i = 0; i < index.count; i += 3) {
      const a = vertices[index.getX(i)];
      const b = vertices[index.getX(i + 1)];
      const c = vertices[index.getX(i + 2)];
      const intersection = new THREE.Vector3();

      if (ray.intersectTriangle(a, b, c, false, intersection)) {
        const dist = ray.origin.distanceToSquared(intersection);
        if (dist < minDist) {
          minDist = dist;
          closest = intersection.clone();
        }
      }
    }

    return closest;
  }

  clearVisuals() {
    for (const line of this.lines) {
      this.scene.remove(line);
      line.geometry.dispose();
      line.material.dispose();
    }
    this.lines = [];

    for (const sphere of this.spheres) {
      this.scene.remove(sphere);
      sphere.geometry.dispose();
      sphere.material.dispose();
    }
    this.spheres = [];
  }

  onResize() {
    const resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
    for (const line of this.lines) {
      line.material.resolution.copy(resolution);
      line.material.needsUpdate = true;
    }
  }


  enable() {
    this.enabled = true;
    this.clearVisuals();
    this.drawAxes(); // Re-draw from raw segments
  }

  disable() {
    this.enabled = false;
    this.clearVisuals(); // Just clear visuals, keep segmentVectors
  }

  getLineSegments() {
    return this.segmentVectors.map(([start, end]) => [start.clone(), end.clone()]);
  }
}

export { AxisDisplay };
