import {
  THREE,
  OrbitControls,
  Triangle,
  LabelsView,
  PointController,
  MeasureButton,
  CalculateParallelLinesIntersection,
  DisplaySegments,
  DisplayRadius,
  LineManager,
  Circle
} from './AppDependencies.js';

export class TriangleApp {
  constructor(canvasId, labelsContainerId, measureButtonId) {
    this.canvas = document.querySelector(`#${canvasId}`);
    this.labelsContainer = document.getElementById(labelsContainerId);
    this.measureButtonElement = document.getElementById(measureButtonId);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0, 18);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio); 
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false;
    this.controls.enableRotate = false;

    this.scene.background = new THREE.Color("white");

    this.scale = 24 * Math.min(0.8, window.innerWidth / window.innerHeight);
    this.triangle = new Triangle(this.scale);
    this.trianglePoints = this.triangle.getPositions();
    this.vertexNames = this.triangle.getLabels();
    this.clampedTrianglePoints = this.triangle.clampedPoints;

    this.labelsView = new LabelsView(this.labelsContainer, this.triangle, this.camera, this.renderer);
    this.lineManager = new LineManager(this.scene);

    this.lineManager.createLine(this.trianglePoints[0], this.trianglePoints[1]);
    this.lineManager.createLine(this.trianglePoints[1], this.trianglePoints[2]);
    this.lineManager.createLine(this.trianglePoints[2], this.trianglePoints[0]);

    this.centroid = new THREE.Vector2(0, 0);
    this.radius = 0.5 * Math.min(1, window.innerWidth / window.innerHeight);
    this.circle = new Circle(this.scene, this.radius);
    this.circleGroup = this.circle.getGroup();

    this.pointController = new PointController(
      this.renderer,
      this.camera,
      this.triangle,
      this.updateVisualization.bind(this),
      this.circleGroup
    );

    this.calculateParallelLinesIntersections = new CalculateParallelLinesIntersection(this.scene, this.triangle);
    this.displaySegments = new DisplaySegments(this.scene, this.triangle, this.labelsContainer, this.vertexNames);
    this.displayRadius = new DisplayRadius(this.scene, this.centroid, this.scale);

    this.measureButton = new MeasureButton(
      this.measureButtonElement,
      this.clampedTrianglePoints,
      this.updateVisualization.bind(this),
      this.circleGroup,
      this.displaySegments
    );

    this.setVertexLabelColors();
    this.setupListeners();
    this.animate();
  }

  setVertexLabelColors() {
    for (let i = 0; i < this.triangle.getVertices().length; i++) {
      document.getElementById('label-' + this.vertexNames[i]).style.color = '#' + this.triangle.getColors()[i].getHexString();
    }
  }

  setupListeners() {
    this.pointController.addMouseListeners();
    this.pointController.addTouchListeners();
    this.renderer.domElement.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.renderer.render(this.scene, this.camera);
    this.labelsView.update();
  }

  updateVisualization(mouseWorld, clamped = false) {
    this.calculateParallelLinesIntersections.clearLines();
    this.displayRadius.clear();
    let P = mouseWorld;

    if (!clamped)
      P = this.triangle.clampToTriangle(new THREE.Vector2(mouseWorld.x, mouseWorld.y), ...this.trianglePoints);

    this.displayRadius.draw(P);

    const intersections = this.calculateParallelLinesIntersections.drawParallels(P);
    if (!intersections) return;

    this.displaySegments.updateSegments(intersections);
    this.displaySegments.drawSideSplits(intersections);
    this.displaySegments.updateSegmentLabels(intersections);
  }
}
const app = new TriangleApp('canvas', 'labels', 'measureButton');