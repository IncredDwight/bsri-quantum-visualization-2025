import * as THREE from 'three';


export class PointController {
  constructor(renderer, camera, triangle, updateVisualization, circleGroup) {
    this.renderer = renderer;
    this.camera = camera;
    this.triangle = triangle;
    this.clampedTrianglePoints = triangle.clampedPoints;
    this.updateVisualization = updateVisualization;
    this.circleGroup = circleGroup;

    this.isDragging = false;

    this.addMouseListeners();
    this.addTouchListeners();
  }

  addMouseListeners() {
    window.addEventListener('mousedown', (event) => {
      if (event.target.closest("#measureButton")) return;
      this.isDragging = true;

      const mousePoint2D = this.getMousePoint2D(event);
      const clampedPoint = this.triangle.clampToTriangle(mousePoint2D, ...this.triangle.getVertices());
      clampedPoint.z = 0;
      this.circleGroup.position.copy(clampedPoint);
      this.updateVisualization(clampedPoint, true);
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (event) => {
      if (!this.isDragging) return;

      const mousePoint2D = this.getMousePoint2D(event);
      const clampedPoint = this.triangle.clampToTriangle(mousePoint2D, ...this.clampedTrianglePoints);
      clampedPoint.z = 0;
      this.circleGroup.position.copy(clampedPoint);
      this.updateVisualization(clampedPoint, true);
    });
  }

  addTouchListeners() {
    const canvas = this.renderer.domElement;

    canvas.addEventListener('touchstart', (event) => {
      if (event.target.closest("#measureButton")) return;
      this.isDragging = true;
    }, { passive: false });

    canvas.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    canvas.addEventListener('touchmove', (event) => {
      if (!this.isDragging || event.touches.length === 0) return;

      const rect = canvas.getBoundingClientRect();
      const touch = event.touches[0];
      const mouseNDC = this.getNormalizedTouchPos(touch, rect);
      const intersectPoint = this.getWorldPointFromNDC(mouseNDC);
      const clampedPoint = this.triangle.clampToTriangle(new THREE.Vector2(intersectPoint.x, intersectPoint.y), ...this.clampedTrianglePoints);
      clampedPoint.z = 0;
      this.circleGroup.position.copy(clampedPoint);
      this.updateVisualization(clampedPoint, true);
    }, { passive: false });

    canvas.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
  }

  getMousePoint2D(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    const mouseNDC = new THREE.Vector2(x, y);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouseNDC, this.camera);
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(planeZ, intersectPoint);
    return new THREE.Vector2(intersectPoint.x, intersectPoint.y);
  }

  getNormalizedTouchPos(touch, rect) {
    const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
    return new THREE.Vector2(x, y);
  }

  getWorldPointFromNDC(mouseNDC) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouseNDC, this.camera);
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(planeZ, intersectPoint);
    return intersectPoint;
  }
}
