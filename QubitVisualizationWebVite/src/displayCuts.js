import * as THREE from 'three';
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";

class DisplayCuts {
  constructor(calculateSideCuts, scene, labelContainer = null, options = {}) {
    this.calculateSideCuts = calculateSideCuts;
    this.scene = scene;
    options = options || {};

    this.cutColor = options.cutColor instanceof THREE.Color ? options.cutColor : new THREE.Color(0xffffff);

    this.maxCuts = Number.isInteger(options.maxCuts) ? options.maxCuts : 18;
    this.stripeSegments = Number.isInteger(options.stripeSegments) ? options.stripeSegments : 10;

    this.lineGroups = [];

    this._initLines();
    //window.addEventListener('resize', () => this._onResize());
  }

  _initLines() {
    for (let i = 0; i < this.maxCuts; i++) {
      const group = new THREE.Group();
      group.mainStripeLine = this._createStripeLine();

      group.add(group.mainStripeLine);
      this.scene.add(group);
      this.lineGroups.push(group);
    }
  }

  _createStripeLine() {
    const geometry = new LineGeometry();
    geometry.setPositions([0, 0, 0, 1, 0, 0]);
    geometry.setColors([1, 1, 1, 1, 1, 1]);
    const material = new LineMaterial({
      linewidth: 10,
      vertexColors: true,
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
      depthTest: true,
      depthWrite: false,
    });
    const line = new Line2(geometry, material);
    line.computeLineDistances();
    line.frustumCulled = false;
    line.renderOrder = 2;
    return line;
  }

  update() {
    const cuts = this.calculateSideCuts.getCuts();

    for (let i = 0; i < this.lineGroups.length; i++) {
      const group = this.lineGroups[i];

      if (i >= cuts.length) {
        group.visible = false;
        continue;
      }

      group.visible = true;
      const cut = cuts[i];

      let colors = cut.color;
      if (Array.isArray(colors)) {
        if (this.isCutColorZero(colors[0], cuts)) colors = [colors[1]];
        else if (this.isCutColorZero(colors[1], cuts)) colors = [colors[0]];
      }

      this._updateLineGeometry(group.mainStripeLine, cut.start, cut.end, this.stripeSegments, colors);
      this.updateLabel(cut);
    }
  }

  updateLabel(cut) {
    if (!cut || !cut.label || !cut.color) return;
    const percent = ((cut.length * 100).toFixed(1) >= 99.9) ? "100.0" : (cut.length * 100).toFixed(1);
    const styleColor = cut.color.getStyle();
    document.getElementById('value-' + cut.label).textContent = percent + "%";
    document.getElementById("label-" + cut.label).style.color = styleColor;
    document.getElementById("value-" + cut.label).style.color = styleColor;
  }

  isCutColorZero(color, cuts) {
    return cuts.some(cut => cut.color === color && Math.round(cut.length * 100) === 0);
  }


  /**
 * Updates the geometry of a line by subdividing it into segments with optional gaps and coloring.
 * Supports solid or alternating colors by accepting either a single THREE.Color or an array of colors.
 * 
 * @param {Line2} line - The line object to update. Must use Line2 with LineGeometry and LineMaterial.
 * @param {THREE.Vector3} start - The starting point of the line.
 * @param {THREE.Vector3} end - The ending point of the line.
 * @param {number} numSegments - Number of segments to divide the line into.
 * @param {THREE.Color | THREE.Color[]} colors - Single color or an array of colors to cycle through for each segment.
 */

  _updateLineGeometry(line, start, end, numSegments, colors) {
    const dir = new THREE.Vector3().subVectors(end, start);
    const length = dir.length();
    if (length === 0 || !isFinite(length)) {
      line.geometry.setPositions([0, 0, 0, 0, 0, 0]);
      line.geometry.setColors([1, 1, 1, 1, 1, 1]);
      line.geometry.needsUpdate = true;
      line.computeLineDistances();
      return;
    }

    dir.normalize();
    const step = length / numSegments;
    const gapFactor = 0.9;
    const positions = [];
    const colorsArray = [];

    const colorArray = Array.isArray(colors) ? colors : [colors];

    for (let i = 0; i < numSegments; i++) {
      const fullStart = start.clone().addScaledVector(dir, i * step);
      const fullEnd = start.clone().addScaledVector(dir, (i + 1) * step);
      const shrink = new THREE.Vector3().subVectors(fullEnd, fullStart).multiplyScalar((1 - gapFactor) / 2);
      const adjStart = fullStart.clone().add(shrink);
      const adjEnd = fullEnd.clone().sub(shrink);

      positions.push(adjStart.x, adjStart.y, adjStart.z, adjEnd.x, adjEnd.y, adjEnd.z);

      const color = colorArray[i % colorArray.length];
      colorsArray.push(color.r, color.g, color.b, color.r, color.g, color.b);
    }

    line.geometry.setPositions(positions);
    line.geometry.setColors(colorsArray);
    line.geometry.needsUpdate = true;
    line.computeLineDistances();
  }

}

export { DisplayCuts };
