Math.degreesToRadians = function (degrees) {
	return degrees * Math.PI / 180;
};

function setup() {
	canvas = createCanvas(100, 100, WEBGL);
	setSize();
}

function draw() {
	//drawing
	background(97, 192, 72);
	rotateX(-0.5 * Math.PI);
	rotateX(Math.degreesToRadians(-imuOrientation.x + offX));
	rotateY(Math.degreesToRadians(-imuOrientation.y + offY));
	rotateZ(Math.degreesToRadians(-imuOrientation.z + offZ));
	cylinder(50, 100);
}

function setSize() {
	canvas.position(container.getBoundingClientRect().left, container.getBoundingClientRect().top);
	resizeCanvas(container.offsetWidth, container.offsetHeight);
}

function windowResized() {
	setSize();
}
