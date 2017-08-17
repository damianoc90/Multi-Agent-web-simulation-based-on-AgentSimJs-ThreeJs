var	loader = new THREE.ObjectLoader();
var pale = [], ruote = [], ali = [];
var drone = null, rover = null;

// LIGHTS
function init_lights() {
	var light_drone = new THREE.PointLight(0xffffff, 1);
	light_drone.position.set(70, 170, -160);
 	scene.add(light_drone);
	
	var light_rover = new THREE.PointLight(0xffffff, 2);
	light_rover.position.set(-85, 5, -20);
 	scene.add(light_rover);
}


// MODELS
function init_grass() {
	loader.load('js/model/grass.json', function (object) {
		var size = 800;
		object.scale.set(size, size, size);
		scene.add(object);
	});
}


function init_solarpanel() {
	loader.load('js/model/solar_panel.json', function (object) {
		var size = 6;
		// i: #pannelli, j = file di pannelli
		for (var i = 0; i < 5; i++) {
			for (var j = 0; j < 5; j++) {
				var clone = object.clone();
				clone.scale.set(size, size, size);
				clone.position.set(i*18, 2.8, (j*40)+50);
				scene.add(clone);
			}
		}
	});
}


function init_windturbine() {
	loader.load('js/model/wind_turbine.json', function(object) {
		var size = 5;
		for (var i = 0; i < 5; i++) {
			var clone = object.clone();
			clone.scale.set(size, size, size);
			clone.position.set((i*80)-100, 0, -20);
			scene.add(clone);
			
			//animations
			pale.push(clone.children[2]);
		}
	});
}


function init_rover_drone() {
	loader.load('js/model/rover.json', function(object) {
		rover = object;
		var size = 15;
		object.scale.set(size, size, size);
		/*
		object.position.set(-400, 7.1, 90);
		object.rotation.y = -80;
		*/
		scene.add(object);
		
		//animations
		for (var i = 1; i <= 4; i++) {
			tmp1 = object.children[i];
			ruote.push(tmp1);
		}
		
		loader.load('js/model/drone.json', function(object) {
			drone = object;
			var size = 35;
			object.scale.set(size, size, size);
			/*
			object.position.set(340, 180, -160);
			object.rotation.y = -0.2;
			*/
			scene.add(object);
			
			//animations
			for (var i = 1; i <= 4; i++) {
				tmp = object.children[i];
				ali.push(tmp);
			}
			
			singleAgentTest();
		});
	});
}


// ANIMATIONS
function animation_windturbine() {
	SPEED = 0.02;
	for (var i = 0; i < pale.length; i++) {
		pale[i].rotation.z -= SPEED;
	}
}
function animation_rover() {
	SPEED = 0.4;
	for (var i = 0; i < ruote.length; i++) {
		ruote[i].rotation.x += SPEED;
	}
}
function animation_drone() {
	SPEED = 1;
	for (var i = 0; i < ali.length; i++) {
		ali[i].rotation.y += SPEED;
	}
}


// UTILITIES
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}


//AgentSimJs
var agent_list = [];
var route_to_go = [];
var spawn_at = [];
var id_counter = 3;
var collision_worker = new Worker('src/collision_worker.js');
function singleAgentTest() {
	this.displayAxis = true;
	this.centralized_worker = true;
	this.radius = 2;
	this.linear_motion = true;
	this.circular_motion = false;
	this.projectile_motion = false;


	var agent, agent2;

	this.centralized_worker = false;

	var movement_type = 'linear_motion';

	/*********************** DECENTRALIZED MOVEMENT WORKER EXAMPLE ***************************/	
	agent = new Agent(1, 1, 2, this.displayAxis, new Worker('src/movement_worker.js'), movement_type, collision_worker, "decentralized");
	agent2 = new Agent(2, 0, 2, this.displayAxis, new Worker('src/movement_worker.js'), movement_type, collision_worker, "decentralized");
	
	agent.buildAgentTexture = function() {
        this.agent_object = drone;
        this.agent_object.name = this.agent_name;

        if (!this.spawned) {
            this.scene.add(this.agent_object);
            this.spawned = true;
        }
        else {
            removeAgent(this.agent_name);
            this.scene.add(this.agent_object);
        }
    }
    agent2.buildAgentTexture = function() {
        this.agent_object = rover;
        this.agent_object.name = this.agent_name;
        this.agent_object.rotation.y = -80;
        if (!this.spawned) {
            this.scene.add(this.agent_object);
            this.spawned = true;
        }
        else {
            removeAgent(this.agent_name);
            this.scene.add(this.agent_object);
        }
    }


	//trajectory definition
	route_to_go = [];
	route_to_go.push(new THREE.Vector3(0, 0, 0));
	route_to_go.push(new THREE.Vector3(30, 50, 100));
	route_to_go.push(new THREE.Vector3(50, 50, 130));
	route_to_go.push(new THREE.Vector3(150, 50, 170));
	route_to_go.push(new THREE.Vector3(160, 50, 180));
	route_to_go.push(new THREE.Vector3(180, 50, 220));


	agent.setRoute(route_to_go);

	this.spawn_x = 120;
	this.spawn_y = 120;
	this.spawn_z = 120;

	var msgbus_worker = new Worker('src/messageBus_worker.js');

	var indexdb = new indexdb_manager();
	indexdb.create_db();


	agent_list.push(agent);

	agent.agent_object = agent;
	agent.setSpawnPoint([{
		x: this.spawn_x,
		y: this.spawn_y,
		z: this.spawn_z
	}]);
	agent.setScene(scene);
	agent.setMessageBus_Worker(msgbus_worker);
	agent.spawn();
	agent.setIndexdb(indexdb);
	agent.findPointOnCircumference(new THREE.Vector3(150, 100, -150));
	agent.plotTrajectory(scene);
	agent.moveAroundPoint();
	agent.setMessageListener();


	agent2.setSpawnPoint([{
		x: -400,
		y: 7.3,
		z: 90
	}]);
	agent2.setScene(scene);
	agent2.spawn();
	agent2.setIndexdb(indexdb);
	agent2.setMessageBus_Worker(msgbus_worker);
	agent2.setMessageListener();


	//to simulate a delay in message transmission and prevent msg flooding a pre-defined amount of message will be skipped
	var counter = 40;
	agent2.processReceivedMessage = function(msg) {
		if (msg.agent_id == 1) {
			if (counter == 40) {
				var point_to_go = [];
				point_to_go.push(new THREE.Vector3(agent2.agent_object.position.x, agent2.agent_object.position.y, agent2.agent_object.position.z));
				point_to_go.push(new THREE.Vector3(msg.x, 3, msg.z));
				agent2.initSplineTraj(point_to_go);
				agent2.plotTrajectory(scene);

				counter = 0;
				agent2.broadcast_message(msg);
			}
			else { counter = counter + 1; }
		}
	}
	agent2.setMessageListener(agent2.processReceivedMessage);
}