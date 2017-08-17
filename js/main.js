if (!Detector.webgl) Detector.addGetWebGLMessage();
var loader;
var camera, controls, scene, renderer;

init();
animate();



function init() {
	// SCENE
	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0xf5feff, 0.001);
	
	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(scene.fog.color);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	
	var container = document.getElementById('container');
	container.appendChild(renderer.domElement);
	
	// CAMERA
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(0, 160, 590);
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.addEventListener('change', render); // remove when using animation loop
	controls.enableZoom = false;
	
	
	// WORLD
	initEnvironment(scene, camera, renderer, controls);
	
	loader = new THREE.ObjectLoader();
	
	init_lights();
	init_grass();
	init_solarpanel();
	init_windturbine();
	//init_rover();
	//init_drone();
	init_rover_drone();
	
// 	singleAgentTest();
	
	window.addEventListener('resize', onWindowResize, false);
}

function animate() {
	requestAnimationFrame(animate);
	controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true
	render();
}


function render() {
	animation_windturbine();
	animation_rover();
	animation_drone();
	renderer.render(scene, camera);
}

