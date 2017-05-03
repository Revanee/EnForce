var scene, camera, renderer;
var geometry, material, mesh;

init();
animate();

function init() {

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.z = 1000;

	/*geometry = new THREE.BoxGeometry(200, 200, 200);
	material = new THREE.MeshBasicMaterial({
		color: 0xff0000,
		wireframe: true
	});

	mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);*/

	/*var lights = [];
	lights[0] = new THREE.PointLight(0xffffff, 1, 0);
	lights[1] = new THREE.PointLight(0xffffff, 1, 0);
	lights[2] = new THREE.PointLight(0xffffff, 1, 0);

	lights[0].position.set(0, 200, 0);
	lights[1].position.set(100, 200, 100);
	lights[2].position.set(-100, -200, -100);

	scene.add(lights[0]);
	scene.add(lights[1]);
	scene.add(lights[2]);*/

	geometry = new THREE.CylinderGeometry(400, 400, 700, 256);
	material = new THREE.MeshBasicMaterial({
		color: 0xffff00
	});
	mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);

	document.body.appendChild(renderer.domElement);

}

function animate() {

	requestAnimationFrame(animate);

	var q = new THREE.Quaternion(imuOrientation.x, imuOrientation.y, imuOrientation.z, imuOrientation.w);

	mesh.rotation.setFromQuaternion(q);

	/*mesh.rotation.x = imuOrientation.x * Math.PI / 180;
	mesh.rotation.y = imuOrientation.y * Math.PI / 180;
	mesh.rotation.z = imuOrientation.z * Math.PI / 180;*/

	renderer.render(scene, camera);

}
