import * as THREE from 'three';
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";

const AXIS_NAMES = ['X', 'Y', 'Z']; //Correspond to sliders ID's

class PointController {
  constructor(points, directions, axisDisplay, tetrahedron) {
    this.points = points;
    this.directions = directions;
    this.axisDisplay = axisDisplay;
    AXIS_NAMES.forEach((axis, index) => {
      const slider = document.getElementById(`slider${axis}`);
      if (slider) {
        this[`slider${axis}`] = slider;
        slider.addEventListener('input', () => {
          this.onSliderChanged(index, parseFloat(slider.value));
        });
      }
    });

    this.sliderMapping = new Map();

    this.sliderMapping.set(0, [0, 0, 1]);
    this.sliderMapping.set(1, [0, 1, 1]);
    this.sliderMapping.set(2, [1, 1, 1]);
    this.sliderMapping.set(3, [0, 0, 0]);

    this.tetrahedron = tetrahedron;

  }

  onSliderChanged(index, value, manual = false) {
    const segments = this.axisDisplay.getLineSegments();
    if (!Array.isArray(segments) || !segments[index]) {
      console.warn(`Invalid or missing segment data at index ${index}`);
      return;
    }

    const point = this.points[0];
    const parent = point?.parent;
    if (!point || !parent) return;

    const ratios = [];

    for (let i = 0; i < segments.length; i++) {
      if (i === index) continue;

      const [p1, p2] = segments[i];
      const localP1 = parent.worldToLocal(p1.clone());
      const localP2 = parent.worldToLocal(p2.clone());
      const segmentLength = localP1.distanceTo(localP2);

      if (segmentLength === 0) {
        console.warn(`Zero-length segment at index ${i}`);
        ratios.push(0);
        continue;
      }

      const projectedLength = localP2.distanceTo(point.position.clone());
      const ratio = projectedLength / segmentLength;
      ratios.push(ratio);
    }

    const otherAxes = AXIS_NAMES.filter((_, i) => i !== index);

    if(!manual){
        this[`slider${otherAxes[0]}`].value = (1 - ratios[0]).toFixed(5);
        this[`slider${otherAxes[1]}`].value = (1 - ratios[1]).toFixed(5);
    }

    const direction = this.directions[index];
    if (!direction) return;

    const [p1, p2] = segments[index];
    const axisLength = p1.distanceTo(p2);
    const epsilon = 0.1;
    if(axisLength <= epsilon)
        return;
    const target = p1.clone().add(direction.clone().normalize().multiplyScalar(value * axisLength));

    point.position.copy(parent.worldToLocal(target));
  }


  moveToVertex(vertexIndex){
    
      this.tetraVertices = this.tetrahedron.scaleTetrahedron(0.9995);

      const point = this.points[0];

      const sliderMap = this.sliderMapping.get(vertexIndex);
      
      for(let i = 0; i < AXIS_NAMES.length; i++){
          this[`slider${AXIS_NAMES[i]}`].value = sliderMap[i];
          this.onSliderChanged(i, parseFloat(this[`slider${AXIS_NAMES[i]}`].value), true);
      }

      point.position.copy(point.parent.worldToLocal(this.tetraVertices[vertexIndex]));
  }
}

export { PointController };
