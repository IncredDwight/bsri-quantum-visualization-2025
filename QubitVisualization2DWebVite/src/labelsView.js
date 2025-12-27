import * as THREE from 'three';

export class LabelsView {
  constructor(container, triangle, camera, renderer) {
    this.container = container;
    this.triangle = triangle;
    this.camera = camera;
    this.renderer = renderer;
    this.vertexNames = triangle.vertexNames;
    this.createVertexLabels();
  }

  createVertexLabels() {
    const canvasRect = this.renderer.domElement.getBoundingClientRect();

    this.triangle.getVertices().forEach((v, i) => {
      const label = document.createElement('div');
      label.style.color = '#' + v.color.getHexString();
      label.style.fontFamily = 'sans-serif';
      label.style.userSelect = 'none';
      label.style.pointerEvents = 'none';
      label.style.fontSize = '45px';
      label.style.position = 'absolute';
      label.textContent = this.vertexNames[i];
      this.container.appendChild(label);

      const pos3D = new THREE.Vector3(v.position.x, v.position.y, 0).project(this.camera);
      const x = (pos3D.x + 1) / 2 * canvasRect.width;
      const y = (-pos3D.y + 1) / 2 * canvasRect.height;
      label.style.transform = `translate(${x}px, ${y}px)`;

      v.labelEl = label;
    });
  }

  update() {
    const canvasRect = this.renderer.domElement.getBoundingClientRect();

    this.triangle.getVertices().forEach((v, i) => {
      const pos3D = new THREE.Vector3(v.position.x, v.position.y, 0);
      pos3D.project(this.camera);

      if (pos3D.z < -1 || pos3D.z > 1 || Math.abs(pos3D.x) > 1 || Math.abs(pos3D.y) > 1) {
        v.labelEl.style.display = 'none';
        return;
      }

      const x = (pos3D.x + 1) / 2 * canvasRect.width + canvasRect.left;
      let y = (-pos3D.y + 1) / 2 * canvasRect.height + canvasRect.top + 60;
      if (i === 0) y -= 60;

      const label = v.labelEl;
      label.style.position = 'absolute';
      label.style.left = `${x}px`;
      label.style.top = `${y}px`;
      label.style.transform = 'translate(-50%, -100%)';
      label.style.display = 'block';
    });
  }
}
