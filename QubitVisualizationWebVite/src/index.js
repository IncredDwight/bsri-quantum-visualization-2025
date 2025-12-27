import * as THREE from "three";

import { Tetrahedron } from "./tetrahedron.js";
import { Vertex } from "./tetrahedron.js";
import { VerticesLabel } from "./verticesLabel.js";
import { PlanesGenerator } from "./planesGenerator.js";
import { CalculatePlaneIntersection } from "./calculatePlaneIntersection.js";
import { CalculateSideCuts } from "./calculateSideCuts.js";
import { DisplayCuts } from "./displayCuts.js";
import { PointController } from "./pointController.js";
import { IntersectionView } from "./intersectionView.js";
import { AxisDisplay } from "./axisDisplay.js";
import { MeasureButton } from "./measureButton.js";
import { RadiusDisplay } from "./radiusDisplay.js";

class TetrahedronApp {
  constructor(container = document.body) {
    this.TETRAHEDRON_SIZE = 60;
    this.POINT_COUNT = 1;

    this.intersectionViewVisible = false;
    document.getElementById('toggle-visuals').addEventListener('change', e => {
      this.intersectionViewVisible = e.target.checked;
    });

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("white");
    
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 100;
    this.camera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      1000
    );
    this.camera.position.set(0, 15, 30);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 20, 10);
    this.scene.add(dirLight);
    this.scene.add(new THREE.AmbientLight(0x404040));

    this.tetra = new Tetrahedron(this.scene, this.camera, this.TETRAHEDRON_SIZE);
    this.labels = new VerticesLabel(this.scene, this.tetra, this.camera);

    this.points = [];
    for (let i = 0; i < this.POINT_COUNT; i++) {
      const point = new THREE.Object3D();
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(2, 16, 16),
        new THREE.MeshStandardMaterial({ color: new THREE.Color("blue") })
      );
      point.add(sphere);
      this.tetra.group.add(point);
      this.points.push(point);
    }

    this.planesGen = new PlanesGenerator(this.scene, this.tetra, this.points);
    this.planeIntersectionCalc = new CalculatePlaneIntersection(this.planesGen, this.tetra, this.scene);
    this.sideCuts = new CalculateSideCuts(this.planeIntersectionCalc, this.tetra.a, this.tetra.getColors());

    this.displayCuts = new DisplayCuts(this.sideCuts, this.scene, null, {
      cutColor: new THREE.Color(0xffffff),
      thickness: 10,
      maxCuts: 18,
      stripeSegments: 20
    });

    this.intersectionView = new IntersectionView(
      this.tetra,
      this.planesGen,
      this.sideCuts,
      this.scene,
      {
        color: new THREE.Color(0xADFF2F),
        thickness: 5,
      }
    );

    this.intersectionLogic = this.intersectionView.calculator;
    this.axisDisplay = new AxisDisplay(this.scene, this.points[0], this.intersectionLogic.getIntersectionAxis(), this.tetra.mesh);
    this.pointController = new PointController(this.points, this.intersectionLogic.getIntersectionAxis(), this.axisDisplay, this.tetra);
    this.measureButton = new MeasureButton(this.pointController);
    this.radiusDisplay = new RadiusDisplay(this.scene, this.tetra, this.points[0]);

    this.animate();
  }

  update() {
    this.tetra.update();
    this.tetra.highlightFaces(this.points[0]);

    this.labels.update();
    this.planesGen.update();
    this.planeIntersectionCalc.update();
    this.sideCuts.update();
    this.displayCuts.update();
    this.intersectionLogic.update();

    const axes = this.intersectionLogic.getIntersectionAxis();
    this.pointController.directions = axes;
    this.axisDisplay.directions = axes;

    this.intersectionView.disable();
    this.axisDisplay.disable();
    this.axisDisplay.drawAxes();

    if (this.intersectionViewVisible) {
      this.intersectionView.enable();
      this.axisDisplay.enable();
      this.intersectionView.update();
      this.axisDisplay.drawAxes(axes);
    }

    this.radiusDisplay.update();

    this.renderer.render(this.scene, this.camera);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.update();
  }
}

window.onload = () => new TetrahedronApp();

export { Vertex };
