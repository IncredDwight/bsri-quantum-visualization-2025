import * as THREE from "three";
//import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
class VerticesLabel {
  constructor(scene, visualization3D, camera) {
    this.scene = scene;
    this.visualization3D = visualization3D;
    this.camera = camera;
    this.labels = []; // array of THREE.Sprite for labels

    this.labelsText = ["|D>", "|A>", "|B>", "|C>"];

    this.createLabels();
  }

  createLabels() {
    const vertices = this.visualization3D.getVerticesPosition();
    const verticesLabeled = Object.values(this.visualization3D.getVertices());
    const center = this.visualization3D.getCenter();

    for(let i = 0; i < vertices.length && i < this.labelsText.length; i++) {
      const dir = new THREE.Vector3().subVectors(vertices[i], center).normalize();
      const labelPos = new THREE.Vector3().copy(vertices[i]).add(dir.multiplyScalar(0.5));
      console.log(verticesLabeled[i]);
      // Create a canvas for text
      const canvas = document.createElement('canvas');
      const size = 128;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.font = '60px Arial';
      ctx.fillStyle = verticesLabeled[i].color.getStyle();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.labelsText[i], size / 2, size / 2);

      // Create texture from canvas
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;

      // Create sprite material
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true });

      // Create sprite
      const sprite = new THREE.Sprite(material);
      sprite.position.copy(labelPos);
      sprite.scale.set(9, 9, 3); // adjust size as needed

      this.scene.add(sprite);
      this.labels.push(sprite);
    }
  }

  update() {
  const vertices = this.visualization3D.getVerticesPosition();
  const center = this.visualization3D.getCenter();

  for(let i = 0; i < this.labels.length; i++) {
    const dir = new THREE.Vector3().subVectors(vertices[i], center).normalize();
    const labelPos = vertices[i].clone().add(dir.multiplyScalar(5));
    this.labels[i].position.copy(labelPos);

    // Make label face camera
    this.labels[i].quaternion.copy(this.camera.quaternion);
  }
}
}

export {VerticesLabel};
