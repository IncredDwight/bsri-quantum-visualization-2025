import * as THREE from 'three';

export class Triangle {
  constructor(scale) {
    this.scale = scale;
    this.points = [
      new THREE.Vector2(0.5, Math.sqrt(3) / 2),
      new THREE.Vector2(1, 0),
      new THREE.Vector2(0, 0)
    ].map(p => p.multiplyScalar(scale));

    this._vertices = {
        A: {position: this.points[0], color: new THREE.Color(0xff0000), label: "A"},
        B: {position: this.points[1], color: new THREE.Color(0x0000ff), label: "B"},
        C: {position: this.points[2], color: new THREE.Color(0xFFA500), label: "C"}
    };

    this.vertexNames = ['A', 'B', 'C'];
    this.probabilities = [0.33, 0.33, 0.33];

    this.centroid = this.computeCentroid(this.points);
    this.points.forEach(p => p.sub(this.centroid));

    this.clampedPoints = this.createOffsetTriangle(-0.005);
    this.dragArea = this.points.map(p =>
      p.clone().sub(this.centroid).multiplyScalar(3).add(this.centroid)
    );
  }

  getVertices(){
      return Object.values(this._vertices);
  }

  getPositions(){
      return this.points;
  }

  getColors(){
      return [this._vertices.A.color, this._vertices.B.color, this._vertices.C.color];
  }

  getLabels(){
      return [this._vertices.A.label, this._vertices.B.label, this._vertices.C.label];
  }

  computeCentroid(points) {
    const centroid = new THREE.Vector2();
    points.forEach(p => centroid.add(p));
    return centroid.multiplyScalar(1 / points.length);
  }

  createOffsetTriangle(offset) {
    const [A, B, C] = this.points;

    function vertexNormal(prev, curr, next) {
      const edge1 = curr.clone().sub(prev).normalize();
      const edge2 = next.clone().sub(curr).normalize();
      const n1 = new THREE.Vector2(-edge1.y, edge1.x);
      const n2 = new THREE.Vector2(-edge2.y, edge2.x);
      return n1.add(n2).normalize();
    }

    return [
      A.clone().add(vertexNormal(C, A, B).multiplyScalar(offset)),
      B.clone().add(vertexNormal(A, B, C).multiplyScalar(offset)),
      C.clone().add(vertexNormal(B, C, A).multiplyScalar(offset))
    ];
  }

  clampToTriangle(p) {
    const [a, b, c] = this.clampedPoints;
    const v0 = b.clone().sub(a), v1 = c.clone().sub(a), v2 = p.clone().sub(a);
    const d00 = v0.dot(v0), d01 = v0.dot(v1), d11 = v1.dot(v1);
    const d20 = v2.dot(v0), d21 = v2.dot(v1);
    const denom = d00 * d11 - d01 * d01;
    let v = (d11 * d20 - d01 * d21) / denom;
    let w = (d00 * d21 - d01 * d20) / denom;
    let u = 1 - v - w;

    if (u < 0) { u = 0; v = THREE.MathUtils.clamp(v, 0, 1); w = 1 - v; }
    if (v < 0) { v = 0; u = THREE.MathUtils.clamp(u, 0, 1); w = 1 - u; }
    if (w < 0) { w = 0; u = THREE.MathUtils.clamp(u, 0, 1); v = 1 - u; }

    return a.clone().multiplyScalar(u).add(b.clone().multiplyScalar(v)).add(c.clone().multiplyScalar(w));
  }
}

