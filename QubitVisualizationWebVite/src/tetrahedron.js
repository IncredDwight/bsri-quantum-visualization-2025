import * as THREE from "three";

class Vertex {
	constructor(position, color) {
		this.position = position;
		this.color = color;
	}
}

class Tetrahedron {
	constructor(scene, camera, size, position = new THREE.Vector3(0,0,0)) {
		this.a = size * Math.min(0.8, window.innerWidth / window.innerHeight);;
		this.scene = scene;
		this.position = position.clone();

		this.group = new THREE.Group();
		this.group.position.copy(this.position);
		this.scene.add(this.group);

		this.rotationSpeed = 120;
		this.vertices = this.createVertices();
		this.mesh = this.createMesh();
		this.faces = this.createFaces();
		this.highlightMeshes = this.createHighlightMeshes();
		this.highlightMeshes.forEach(mesh => this.group.add(mesh));

		this.group.add(this.mesh);
		this.camera = camera;

		this.VertexID = { D:0, A:1, B:2, C:3 };
		this.orderedKeys = ['D', 'A', 'B', 'C'];

		this._vertices = {
			D: { position: this.vertices[0], color: new THREE.Color(0xCCFF00), label: 'D' },
			A: { position: this.vertices[1], color: new THREE.Color(0xff0000), label: 'A' },
			B: { position: this.vertices[2], color: new THREE.Color(0x0000ff), label: 'B' },
			C: { position: this.vertices[3], color: new THREE.Color(0xFFA500), label: 'C' }
		};

		this.keyStates = {};
		window.addEventListener('keydown', e => this.keyStates[e.code] = true);
		window.addEventListener('keyup', e => this.keyStates[e.code] = false);

		this.clock = new THREE.Clock();
		this.lastTouch = null;
		this.rotationSpeedTouch = 0.3;
		this._initTouchControls();
		console.log(this._vertices);
	}
	_initTouchControls() {
		this.lastTouch = null;
		this.lastMouse = null;
		this.isMouseDown = false;
		this.rotationSpeedTouch = 1;

  // Create spherical coordinates for camera
		this.spherical = new THREE.Spherical();
		const offset = new THREE.Vector3().subVectors(this.camera.position, this.group.position);
		this.spherical.setFromVector3(offset);

		this._applyOrbitRotation = (dx, dy) => {
			const deltaTheta = -dx * this.rotationSpeedTouch * 0.005;
			const deltaPhi = -dy * this.rotationSpeedTouch * 0.005;

			this.spherical.theta += deltaTheta;
			this.spherical.phi += deltaPhi;

    // Clamp phi (avoid flipping)
			const EPS = 0.01;
			this.spherical.phi = Math.max(EPS, Math.min(Math.PI - EPS, this.spherical.phi));

    // Convert back to Cartesian position
			const newPos = new THREE.Vector3().setFromSpherical(this.spherical);
			this.camera.position.copy(newPos.add(this.group.position));
			this.camera.lookAt(this.group.position);
		};

  // Touch events
		window.addEventListener('touchstart', (e) => {
			if (e.touches.length === 1) {
				this.lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
			}
		});

		window.addEventListener('touchmove', (e) => {
			if (e.touches[0].target.closest("#controls")) return;
			if (e.touches.length === 1 && this.lastTouch) {
				const touch = e.touches[0];
				const dx = touch.clientX - this.lastTouch.x;
				const dy = touch.clientY - this.lastTouch.y;

				this._applyOrbitRotation(dx, dy);

				this.lastTouch = { x: touch.clientX, y: touch.clientY };
			}
		});

		window.addEventListener('touchend', () => {
			this.lastTouch = null;
		});

  // Mouse events
		window.addEventListener('mousedown', (e) => {
			if (e.target.closest("#controls")) return;
			this.lastMouse = { x: e.clientX, y: e.clientY };
			this.isMouseDown = true;
		});

		window.addEventListener('mousemove', (e) => {
			if (!this.isMouseDown || !this.lastMouse) return;
			if (e.target.closest("#controls")) return;

			const dx = e.clientX - this.lastMouse.x;
			const dy = e.clientY - this.lastMouse.y;

			this._applyOrbitRotation(dx, dy);

			this.lastMouse = { x: e.clientX, y: e.clientY };
		});

		window.addEventListener('mouseup', () => {
			this.isMouseDown = false;
			this.lastMouse = null;
		});

		window.addEventListener('mouseleave', () => {
			this.isMouseDown = false;
			this.lastMouse = null;
		});
	}




	createVertices() {
		const a = this.a;
		const height = Math.sqrt(6) / 3 * a;
		const baseHeight = Math.sqrt(3) / 2 * a;

		const verts = [
			new THREE.Vector3(0, 2*height/3, 0),
			new THREE.Vector3(-a/2, -height/3, -baseHeight/3),
			new THREE.Vector3(a/2, -height/3, -baseHeight/3),
			new THREE.Vector3(0, -height/3, 2*baseHeight/3)
			];

		let centroid = new THREE.Vector3(0,0,0);
		verts.forEach(v => centroid.add(v));
		centroid.multiplyScalar(1 / verts.length);

		for (let i=0; i<verts.length; i++) {
			verts[i].sub(centroid).add(this.position);
		}

		return verts;
	}

	getVerticesPosition() {
		return Object.values(this._vertices).map(v => v.position.clone());
	}

	getVertices() {
		return this._vertices;
	}

	getColors(){
		return [this._vertices.D.color, this._vertices.A.color, this._vertices.B.color, this._vertices.C.color];
	}

	getCenter() {
		const verts = Object.values(this._vertices);
		let center = new THREE.Vector3(0, 0, 0);
		verts.forEach(v => center.add(v.position));
		center.multiplyScalar(1 / verts.length);
		return center;
	}

	createMesh() {
		const geometry = new THREE.BufferGeometry();

		const positions = new Float32Array(this.vertices.length * 3);
		for (let i=0; i<this.vertices.length; i++) {
			positions[i*3] = this.vertices[i].x;
			positions[i*3+1] = this.vertices[i].y;
			positions[i*3+2] = this.vertices[i].z;
		}
		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

		const indices = [0,1,2, 0,2,3, 0,3,1, 1,3,2];
		geometry.setIndex(indices);
		geometry.computeVertexNormals();

		const material = new THREE.MeshStandardMaterial({
			color: new THREE.Color(0x0000ff),
			transparent: true,
			opacity: 0.05,
			side: THREE.DoubleSide,
			depthWrite: false
		});

		return new THREE.Mesh(geometry, material);
	}
	createFaces() {
		return [
			[this.vertices[0], this.vertices[1], this.vertices[2]],
			[this.vertices[0], this.vertices[2], this.vertices[3]],
			[this.vertices[0], this.vertices[3], this.vertices[1]],
			[this.vertices[1], this.vertices[2], this.vertices[3]],
			];
	}

	createHighlightMeshes() {
		return this.faces.map(faceVerts => {
			const geometry = new THREE.BufferGeometry();
			const vertices = new Float32Array([
				faceVerts[0].x, faceVerts[0].y, faceVerts[0].z,
				faceVerts[1].x, faceVerts[1].y, faceVerts[1].z,
				faceVerts[2].x, faceVerts[2].y, faceVerts[2].z,
				]);
			geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
			geometry.setIndex([0, 1, 2]);
			geometry.computeVertexNormals();

			const material = new THREE.MeshBasicMaterial({
				color: 0xffff00,
				transparent: true,
				opacity: 0.4,
				side: THREE.DoubleSide,
				visible: false,
			});

			return new THREE.Mesh(geometry, material);
		});
	}
	highlightFaces(point) {
		const threshold = 0.15;
		this.faces.forEach((faceVerts, i) => {
			if (!faceVerts || faceVerts.length < 3) {
				console.warn(`Face ${i} is invalid:`, faceVerts);
				return;
			}
			const [v0, v1, v2] = faceVerts;
			if (![v0, v1, v2].every(v => v && !isNaN(v.x) && !isNaN(v.y) && !isNaN(v.z))) {
				console.warn(`Face ${i} has invalid vertices:`, v0, v1, v2);
				return;
			}

			const triangle = new THREE.Triangle(v0, v1, v2);
			const closestPoint = new THREE.Vector3();
			triangle.closestPointToPoint(point.position, closestPoint);
			const dist = closestPoint.distanceTo(point.position);

			this.highlightMeshes[i].material.visible = dist < threshold;
		});
	}




	update() {
		const deltaTime = this.clock.getDelta();
		let horizontal = 0;
		if (this.keyStates['ArrowLeft']) horizontal = -1;
		else if (this.keyStates['ArrowRight']) horizontal = 1;
		let vertical = 0;
		if (this.keyStates['ArrowUp']) vertical = -1;
		else if (this.keyStates['ArrowDown']) vertical = 1;

		const rotationDeltaX = vertical * this.rotationSpeed * (Math.PI / 180) * deltaTime;
		const rotationDeltaY = horizontal * this.rotationSpeed * (Math.PI / 180) * deltaTime;

		this.group.rotateX(rotationDeltaX);
		this.group.rotateY(rotationDeltaY);

		Object.keys(this._vertices).forEach(key => {
			const localPos = this.vertices[this.VertexID[key]].clone(); 

			const worldPos = this.group.localToWorld(localPos);

			this._vertices[key].position = worldPos;
		});
	}

	scaleTetrahedron(scale) {
		const vertices = this.getVerticesPosition();
  // vertices: array of 4 THREE.Vector3
  // scale: number (e.g., 0.9 to shrink, 1.2 to expand)

  // Compute centroid
      const centroid = new THREE.Vector3();
      vertices.forEach(v => {
        centroid.add(v);
      });
      centroid.divideScalar(4);

  // Create scaled vertices
      const scaledVertices = vertices.map(v => {
        const direction = new THREE.Vector3().subVectors(v, centroid);
        direction.multiplyScalar(scale);
        return new THREE.Vector3().addVectors(centroid, direction);
      });

      return scaledVertices;
    }
}

export{Tetrahedron};
export{Vertex};