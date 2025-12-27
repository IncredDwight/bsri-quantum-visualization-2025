import * as THREE from 'three';
import { Vertex } from "./index.js";

class CalculatePlaneIntersection {
  constructor(planesGenerator, visualization3D, scene) {
    this._planesGenerator = planesGenerator;
    this._visualization3D = visualization3D;
    this.scene = scene;

    this.intersectionPoints = [];
    this.intersections = [];

    this.edges = [
      [0, 1], [0, 2], [0, 3],
      [2, 1], [3, 2], [1, 3]
    ];

    this.sphereMarkers = [];
    this.colors = [0xff0000, 0x0000ff, 0x00ff00, 0xffff00, 0x00ffff, 0xffffff];
  }

  intersectEdgePlane(start, end, plane) {
    const dir = new THREE.Vector3().subVectors(end, start);
    const ray = new THREE.Ray(start, dir.clone().normalize());
    const dist = ray.distanceToPlane(plane);

    if (dist !== null && dist >= 0 && dist <= dir.length()) {
      return ray.at(dist, new THREE.Vector3());
    }
    return null;
  }

  update() {
    this.intersectionPoints = [];
    //this.intersections = [];

    // Get current vertex positions in world space
    const verts = this._visualization3D.getVerticesPosition();

    for (let index = 0; index < this._planesGenerator.getPointsCount(); index++) {
      for (const planeMesh of this._planesGenerator.getPlanes(index)) {
        // Get plane world rotation & position
        const planeNormal = new THREE.Vector3(0, 1, 0);
        const q = planeMesh.getWorldQuaternion(new THREE.Quaternion());
        planeNormal.copy(new THREE.Vector3(0, 1, 0).applyQuaternion(q));

        const planePoint = new THREE.Vector3();
        planeMesh.getWorldPosition(planePoint);

        const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, planePoint);

        for (const [i0, i1] of this.edges) {
          const start = verts[i0];
          const end = verts[i1];
          const hit = this.intersectEdgePlane(start, end, plane);
          if (hit) {
            this.intersectionPoints.push(hit);
          }
        }
      }
    }


    this.getIntersections();
    //this.drawIntersections();
  }

  getIntersections() {
    this.intersections = [];

    const result = [];
    const epsilon = 0.001;
    const verts = this._visualization3D.getVertices();
    const orderedKeys = ['D', 'A', 'B', 'C'];

    for (const [i0, i1] of this.edges) {
      //let v0Labled = this._visualization3D.getVertex(i0);
      //let v1Labled = this._visualization3D.getVertex(i1);
      let v0 = verts[orderedKeys[i0]];//verts[i0];
      let v1 = verts[orderedKeys[i1]];
      const matches = this.intersectionPoints.filter(p => {
        const edgeLen = v0.position.distanceTo(v1.position);
        const d = p.distanceTo(v0.position) + p.distanceTo(v1.position);
        return Math.abs(d - edgeLen) < epsilon;
      });
      if (matches.length >= 2) {
        if (matches[0].distanceTo(v0.position) > matches[1].distanceTo(v0.position)) {
          [v0, v1] = [v1, v0]; // swap
        }

        result.push([matches[0], matches[1]]);

        this.intersections.push({
          intersection1: matches[0],
          intersection2: matches[1],
          side: [v0, v1]
        });
      }
    }

    return result;
  }

  drawIntersections() {
  const pairs = this.getIntersections();
  const totalMarkersNeeded = pairs.length * 2;

  // Add new spheres if not enough
  while (this.sphereMarkers.length < totalMarkersNeeded) {
    const s = new THREE.Mesh(
      new THREE.SphereGeometry(0.05 * 25, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff }) // default color
    );
    s.visible = false; // start hidden
    this.scene.add(s);
    this.sphereMarkers.push(s);
  }

  // Update and show necessary spheres
  let markerIndex = 0;
  pairs.forEach(([p1, p2], i) => {
    const c = this.colors[i % this.colors.length];

    const s1 = this.sphereMarkers[markerIndex++];
    s1.position.copy(p1);
    s1.material.color.set(c);
    s1.visible = true;

    const s2 = this.sphereMarkers[markerIndex++];
    s2.position.copy(p2);
    s2.material.color.set(c);
    s2.visible = true;
  });

  // Hide any extra spheres
  for (let i = markerIndex; i < this.sphereMarkers.length; i++) {
    this.sphereMarkers[i].visible = false;
  }
}


  getFullIntersection() {
    return this.intersections;
  }

  getAllIntersectionPoints() {
    return this.intersectionPoints;
  }
}

export { CalculatePlaneIntersection };
