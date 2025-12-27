// CalculateInBetweenPlaneIntersection.js
import * as THREE from 'three';

class CalculateInBetweenPlaneIntersection {
  constructor(visualization3D, planesGenerator) {
    this.visualization3D = visualization3D;
    this.planesGenerator = planesGenerator;

    this.faces = [
      [0, 1, 2],
      [0, 2, 3],
      [0, 3, 1],
      [1, 3, 2]
    ];

    this.orderedKeys = ['D', 'A', 'B', 'C'];
    this.pairsToDraw = [];

  }

  update() {
    this.pairsToDraw = [];
    const verticesLabeled = this.visualization3D.getVertices();
    const pointsCount = this.planesGenerator.getPointsCount();

    for (let i = 0; i < pointsCount; i++) {
      for (const planeObj of this.planesGenerator.getPlanes(i)) {
        planeObj.updateMatrixWorld();

        const planeNormal = new THREE.Vector3(0, 1, 0).applyQuaternion(planeObj.getWorldQuaternion(new THREE.Quaternion()));
        const worldPoint = new THREE.Vector3();
        planeObj.getWorldPosition(worldPoint);

        const slicingPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, worldPoint);

        for (const face of this.faces) {
          const a = verticesLabeled[this.orderedKeys[face[0]]].position.clone();
          const b = verticesLabeled[this.orderedKeys[face[1]]].position.clone();
          const c = verticesLabeled[this.orderedKeys[face[2]]].position.clone();

          const intersectionSegment = this._getPlaneTriangleIntersection(a, b, c, slicingPlane);
          if (intersectionSegment) {
            this.pairsToDraw.push(intersectionSegment);
          }
        }
      }
    }
  }

  _getPlaneTriangleIntersection(a, b, c, plane) {
    const intersections = [];
    this._checkEdgeIntersection(a, b, plane, intersections);
    this._checkEdgeIntersection(b, c, plane, intersections);
    this._checkEdgeIntersection(c, a, plane, intersections);

    if (intersections.length === 2) {
      return [intersections[0], intersections[1]];
    }
    return null;
  }

  _checkEdgeIntersection(start, end, plane, intersections) {
    const dir = new THREE.Vector3().subVectors(end, start);
    const len = dir.length();
    const ray = new THREE.Ray(start, dir.clone().normalize());

    const distToPlane = ray.distanceToPlane(plane);
    if (distToPlane !== null && distToPlane >= 0 && distToPlane <= len) {
      intersections.push(ray.at(distToPlane, new THREE.Vector3()));
    }
  }

  getPairs() {
    return this.pairsToDraw;
  }

  getIntersectionAxis() {
    const uniqueDirections = [];

    for (const [p1, p2] of this.pairsToDraw) {
      const dir = new THREE.Vector3().subVectors(p2, p1).normalize();

      const isDuplicate = uniqueDirections.some(existingDir => {
        const dot = existingDir.dot(dir);
        return Math.abs(dot) > 0.75;
      });

      if (!isDuplicate) {
        uniqueDirections.push(dir);
        //if (uniqueDirections.length >= 4) break;
      }
    }
    return [uniqueDirections[1], uniqueDirections[2], uniqueDirections[3]];
  }
}

export { CalculateInBetweenPlaneIntersection };
