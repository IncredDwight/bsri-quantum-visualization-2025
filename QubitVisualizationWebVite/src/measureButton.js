import * as THREE from 'three';

class MeasureButton{
	constructor(pointController){
		this.button = document.getElementById("MeasureButton");
		this.pointController = pointController;

		this.button.addEventListener('click', () => {
			const a = parseFloat(document.getElementById("value-A").textContent) / 100;
			const b = parseFloat(document.getElementById("value-B").textContent) / 100;
			const c = parseFloat(document.getElementById("value-C").textContent) / 100;
			const d = parseFloat(document.getElementById("value-D").textContent) / 100;

			this.pointController.moveToVertex(this.choose([d, a, b, c]));
		});

	}

	choose(probabilities, outcomes = [0, 1, 2, 3]) {
  		const rand = Math.random();
  		let cumulative = 0;
  		for (let i = 0; i < probabilities.length; i++) {
    		cumulative += probabilities[i];
    		if (rand < cumulative) return outcomes[i];
  		}
	}
}

export{MeasureButton};