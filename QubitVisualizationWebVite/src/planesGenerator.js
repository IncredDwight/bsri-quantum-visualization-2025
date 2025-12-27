import * as THREE from "three";

const PLANES_TRANSPARENCY = 0.15;

class PlanesGenerator {
  /**
   * @param {THREE.Scene} scene - The Three.js scene
   * @param {Visualization3D} visualization3D - Tetrahedron instance
   * @param {Array<THREE.Object3D>} points - Array of point objects to clamp and track
   * @param {Number} transparency - Plane transparency (0..1)
   */
  constructor(scene, visualization3D, points = [], transparency = 0) {
    this.scene = scene;
    this.visualization3D = visualization3D;
    this.points = points; 
    this.transparency = transparency;

    this.faces = [
      [0, 1, 2],
      [0, 2, 3],
      [0, 3, 1],
      [1, 3, 2]
    ];

    this.colors = [
      new THREE.Color(0x0000ff), // blue
      new THREE.Color(0xffff00), // yellow
      new THREE.Color(0xff0000), // red
      new THREE.Color(0x00ff00)  // green
    ];

    this.planes = [];

    this.initPlanes();

    document.getElementById("toggle-plains").addEventListener("change", (e) => {
      if (e.target.checked) this.setTransperancy(PLANES_TRANSPARENCY);
      else this.setTransperancy(0);
      
    });

    this.setTransperancy(transparency);
  }

  initPlanes() {
    this.points.forEach(point => {
      const planeSet = [];

      for(let i = 0; i < this.faces.length; i++) {

        this.sizeSlider = document.getElementById("PlaneSizeSlider");
        const geometry = new THREE.BoxGeometry(100, 0.01, 100);

        const material = new THREE.MeshStandardMaterial({
          color: this.colors[i].clone().multiplyScalar(1.5),
          transparent: true,
          opacity: this.transparency,
          side: THREE.DoubleSide,
          depthWrite: false
        });

        const plane = new THREE.Mesh(geometry, material);

        this.visualization3D.group.add(plane);
        planeSet.push(plane);
      }

      this.planes.push(planeSet);
    });

    const vertsLabeled = this.visualization3D.getVertices(); 

    if (!vertsLabeled || Object.keys(vertsLabeled).length === 0) return;

    const vertices = [
      vertsLabeled.D.position,
      vertsLabeled.A.position,
      vertsLabeled.B.position,
      vertsLabeled.C.position
    ];



    for(let p = 0; p < this.points.length; p++) {
      const point = this.points[p];
      const planeSet = this.planes[p];


      const clamped = point.position;

      // Update planes for this point
      for(let i = 0; i < this.faces.length; i++) {
        const face = this.faces[i];
        const p0 = vertices[face[0]];
        const p1 = vertices[face[1]];
        const p2 = vertices[face[2]];

        const v1 = new THREE.Vector3().subVectors(p1, p0);
        const v2 = new THREE.Vector3().subVectors(p2, p0);
        const normal = new THREE.Vector3().crossVectors(v1, v2).normalize();

        const plane = planeSet[i];
        plane.position.copy(clamped);

        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);
        plane.quaternion.copy(quaternion);
      }
    }
  }

  update() {
    const vertsLabeled = this.visualization3D.getVertices();

    if (!vertsLabeled || Object.keys(vertsLabeled).length === 0) return;

    const vertices = [
      vertsLabeled.D.position,
      vertsLabeled.A.position,
      vertsLabeled.B.position,
      vertsLabeled.C.position
    ];

    for(let p = 0; p < this.points.length; p++) {
      const point = this.points[p];
      const planeSet = this.planes[p];

      const clamped = point.position;

      // Update planes for this point
      for(let i = 0; i < this.faces.length; i++) {
        const face = this.faces[i];
        const p0 = vertices[face[0]];
        const p1 = vertices[face[1]];
        const p2 = vertices[face[2]];

        // Calculate face normal
        const v1 = new THREE.Vector3().subVectors(p1, p0);
        const v2 = new THREE.Vector3().subVectors(p2, p0);
        const normal = new THREE.Vector3().crossVectors(v1, v2).normalize();

        const plane = planeSet[i];
        plane.position.copy(clamped);
        plane.geometry.dispose();
        
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);
      }
    }
  }


  getPlanes(index = 0) {
    return this.planes[index];
  }

  getPointsCount() {
    return this.points.length;
  }

  setTransperancy(value) {
    for (const planeSet of this.planes) {
      for (const plane of planeSet) {
          plane.material.opacity = value;
          
          plane.material.depthWrite = value > 0 ? true : false;
          plane.material.needsUpdate = true;
      }
    }
  } 

}

export {PlanesGenerator};