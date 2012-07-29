function Integrator () {
	var DAMPING = 0.5; // 0.5
	var ATTRACTION = 0.2; // 0.2
	this.targeting;
	this.target;
	this.value = 0;
	this.vel = 0.01;
	this.accel = 0;
	this.force = 5;
	this.mass = 1;
	this.prev = Number.MAX_VALUE;
	this.epsilon = 0.1;
	
	if (arguments.length === 0) {
		this.value = 0;
		this.damping = DAMPING;
		this.attraction = ATTRACTION;
	}
	else if (arguments.length === 1) {
		this.value = arguments[0];
		this.damping = DAMPING;
		this.attraction = ATTRACTION;
	}
	else if (arguments.length === 3) {
		this.value = arguments[0];
		this.damping = arguments[1];
		this.attraction = arguments[2];
	}
	else if (arguments.length === 4) {
		this.value = arguments[0];
		this.damping = arguments[1];
		this.attraction = arguments[2];
		this.epsilon = arguments[3];
	}
	else if (arguments.length === 5) {
		this.value = arguments[0];
		this.damping = arguments[1];
		this.attraction = arguments[2];
		this.epsilon = arguments[3];
		this.mass = arguments[4];
	}

	this.update = function () {
		if (this.targeting) {
			this.force = this.attraction * (this.target - this.value);
		}
		this.accel = this.force / this.mass;
		this.vel = (this.vel + this.accel) * this.damping;
		this.value += this.vel;
		this.force = 0;
		if (Math.abs(this.value - this.target) < this.epsilon) {
			this.value = this.target;
			this.vel = 0;
			this.targeting = false;
			return false;
		}
		this.prev = this.value;
		
		return true;
	}
	
	this.setupTarget = function (t) {
		this.targeting = true;
		this.target = t;
	}
	
	this.noTarget = function () {
		this.targeting = false;
	}
}









