import * as THREE from 'three';
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";

class RadiusDisplay {
	constructor(scene, tetra, point, color = "#ff00ff"){
		this.tetra = tetra;
		this.scene = scene;
		this.distanceLine = null;

		this.point = point;

		document.getElementById("label-R").style.color = color;
	}

	update(){
	  const center = this.tetra.getCenter();

      const pointPos = this.point.getWorldPosition(new THREE.Vector3());
      const distance = pointPos.distanceTo(center) / 50;

      document.getElementById("label-R").textContent = distance.toFixed(2);




      if (!this.distanceLine) {
        const geometry = new LineGeometry();
        geometry.setPositions([
          pointPos.x, pointPos.y, pointPos.z,
          center.x, center.y, center.z
          ]);

        const material = new LineMaterial({
          color: 0xff00ff,
          linewidth: 5,
          resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
        });

        this.distanceLine = new Line2(geometry, material);
        this.distanceLine.computeLineDistances();
        this.distanceLine.frustumCulled = false;
        this.scene.add(this.distanceLine);
      } else {
        this.distanceLine.geometry.setPositions([
          pointPos.x, pointPos.y, pointPos.z,
          center.x, center.y, center.z
          ]);
        this.distanceLine.geometry.needsUpdate = true;
        this.distanceLine.computeLineDistances();
      }
    }	
}

export{RadiusDisplay};