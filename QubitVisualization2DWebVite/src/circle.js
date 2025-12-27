
import * as THREE from 'three';

export class Circle {
  constructor(scene, radius = 1, segments = 16, outlineWidth = 0.05) {
    this.radius = radius;
    this.segments = segments;
    this.outlineWidth = outlineWidth;

    this.group = new THREE.Group();

    this.outerCircle = this._createCircle(radius + outlineWidth, 'black', 9);
    this.innerCircle = this._createCircle(radius, 'white', 10);

    this.group.add(this.outerCircle);
    this.group.add(this.innerCircle);

    this.group.visible = true;
    scene.add(this.group);
  }

  _createCircle(radius, color, renderOrder) {
    const geometry = new THREE.CircleGeometry(radius, this.segments);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      depthTest: false,
      transparent: true
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = renderOrder;
    return mesh;
  }

  getGroup() {
    return this.group;
  }

  setPosition(pos) {
    this.group.position.set(pos.x, pos.y, 0);
  }

  setVisible(visible) {
    this.group.visible = visible;
  }

  setRadius(newRadius) {
    this.group.clear();
    this.radius = newRadius;

    this.outerCircle = this._createCircle(this.radius + this.outlineWidth, 'black', 9);
    this.innerCircle = this._createCircle(this.radius, 'white', 10);

    this.group.add(this.outerCircle);
    this.group.add(this.innerCircle);
  }
}
