import * as THREE from 'three';
import { LineManager } from './LineManager.js';

export class CalculateParallelLinesIntersection {
  constructor(scene, triangle) {
    this.scene = scene;
    this.triangle = triangle;
    this.trianglePoints = triangle.getPositions();
    this.lineManager = new LineManager(scene);
  }

  clearLines() {
    this.lineManager.clearLines();
  }

  lineIntersection(p1, p2, q1, q2) {
    const r = p2.clone().sub(p1);
    const s = q2.clone().sub(q1);
    const rxs = r.x * s.y - r.y * s.x;
    if (Math.abs(rxs) < 1e-6) return null;

    const qp = q1.clone().sub(p1);
    const t = (qp.x * s.y - qp.y * s.x) / rxs;
    const u = (qp.x * r.y - qp.y * r.x) / rxs;

    if (u < 0 || u > 1 || t < 0 || t > 1) return null;
    return p1.clone().add(r.multiplyScalar(t));
  }

  drawParallels(P) {
    const allHits = [];
    const parallelData = [];

    for (let i = 0; i < 3; i++) {
      const edgeStart = this.trianglePoints[i];
      const edgeEnd = this.trianglePoints[(i + 1) % 3];
      const edgeDir = edgeEnd.clone().sub(edgeStart).normalize();

      const parallelStart = P.clone().sub(edgeDir.clone().multiplyScalar(100));
      const parallelEnd = P.clone().add(edgeDir.clone().multiplyScalar(100));

      const intersections = [];

      for (let j = 0; j < 3; j++) {
        const q1 = this.trianglePoints[j];
        const q2 = this.trianglePoints[(j + 1) % 3];
        const hit = this.lineIntersection(parallelStart, parallelEnd, q1, q2);
        if (hit) intersections.push(hit);
      }

      if (intersections.length === 2) {
        const clippedStart = intersections[0];
        const clippedEnd = intersections[1];

        allHits.push(clippedStart, clippedEnd);
        parallelData.push({
          start: clippedStart,
          end: clippedEnd,
          dir: edgeDir.clone(),
          sideIndex: i
        });
      }
    }

    for (let i = 0; i < parallelData.length; i++) {
      const { start, end, sideIndex } = parallelData[i];
      const baseLine = { p1: start.clone(), p2: end.clone() };

      let pts = [baseLine.p1, baseLine.p2];

      for (let j = 0; j < parallelData.length; j++) {
        if (i === j) continue;
        const other = parallelData[j];
        const hit = this.lineIntersection(baseLine.p1, baseLine.p2, other.start, other.end);
        if (hit) pts.push(hit);
      }

      pts.sort((a, b) => {
        const projA = a.clone().sub(baseLine.p1).dot(baseLine.p2.clone().sub(baseLine.p1));
        const projB = b.clone().sub(baseLine.p1).dot(baseLine.p2.clone().sub(baseLine.p1));
        return projA - projB;
      });

      const I01 = this.lineIntersection(
        parallelData[0].start,
        parallelData[0].end,
        parallelData[1].start,
        parallelData[1].end
      );

      let color = this.triangle.getVertices()[(sideIndex + 1) % 3].color;
      let color2 = this.triangle.getVertices()[(sideIndex + 0) % 3].color;
      if (i === 1) {
        const temp = color;
        color = color2;
        color2 = temp;
      }

      for (let k = 0; k + 1 < pts.length; k++) {
        const seg = this.lineManager.createLine(pts[k + 1], I01, color, 5, { depthTest: false });
        const seg2 = this.lineManager.createLine(pts[k], I01, color2, 5, { depthTest: false });

        if (!seg || !seg2) return;
      }
    }

    return allHits;
  }
}
