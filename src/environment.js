
var object_internal_id=1;
function initEnvironment(scene_sim,camera,render,controls){

		var planeGeometry = new THREE.PlaneGeometry( 20000, 20000 );   
        var planeMaterial = new THREE.MeshBasicMaterial( { color: 0xeeeeee  } );
        var plane = new THREE.Mesh( planeGeometry, planeMaterial );
                plane.rotateX( - Math.PI / 2 );
                plane.position.y = 0;
                plane.position.z = 0;
                plane.receiveShadow = true;
                //scene_sim.add( plane );    

        var helper = new THREE.GridHelper( 10000, 100 );
                //helper.rotateX( 0);
                helper.position.y = 0;
                helper.position.z = 0;
                helper.material.opacity = 0.25;
                helper.material.transparent = true;
                helper.name="grid";
                scene_sim.add( helper );
  		
    
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = false;


         var light;
        scene_sim.add( new THREE.AmbientLight( 0x404040 ) );
        light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 0,1, 0 );
        scene_sim.add( light );


		var axisHelper = new THREE.AxisHelper( 1000 );
	    
        scene_sim.add( axisHelper );
        
        //spawnRandomShapeInScene(scene_sim,40,100);
        
}
function spawnShapeAt(scene,x,y,z,type,collision_worker){

    if(type=="cube"){
             var cube_dimension=7;
            var cube=createCube(cube_dimension,cube_dimension,cube_dimension);
            cube.position.x=x;
            cube.position.y=y;
            cube.position.z=z;
            scene.add(cube);

    }else if(type=="sphere"){
            var sphere=createSphere(4,20,20);
            sphere.position.x=x;
            sphere.position.y=y;
            sphere.position.z=z;
            scene.add(sphere);
    }else if(type=="triangle"){
            var triangle=createTriangle(4);
            triangle.position.x=x;
            triangle.position.y=y;
            triangle.position.z=z;
            scene.add(triangle);
    }
             this.collision_worker.postMessage([{
                    x: x,
                    y: y,
                    z: z,
                    agent_id:'object_'+object_internal_id,
                    type:'object'
                }]);
             object_internal_id++;
}
function randomSpawn(scene,density,spawn_range){
    spawnRandomShapeInScene(scene,density,spawn_range);
}

function spawnRandomShapeInScene(scene,density,spawn_range,collision_worker){
        var cube_dimension=7;
        for(var i=0;i<density;i++){
            var cube=createCube(cube_dimension,cube_dimension,cube_dimension);
            cube.position.x=getRandom(-spawn_range,spawn_range);
            cube.position.y=getRandom(-spawn_range,spawn_range);
            cube.position.z=getRandom(-spawn_range,spawn_range);
            var sphere=createSphere(4,20,20);
            sphere.position.x=getRandom(-spawn_range,spawn_range);
            sphere.position.y=getRandom(-spawn_range,spawn_range);
            sphere.position.z=getRandom(-spawn_range,spawn_range);
            var triangle=createTriangle(4);
            triangle.position.x=getRandom(-spawn_range,spawn_range);
            triangle.position.y=getRandom(-spawn_range,spawn_range);
            triangle.position.z=getRandom(-spawn_range,spawn_range);
            scene.add(sphere);
            scene.add(cube);
            scene.add(triangle);
            this.collision_worker.postMessage([{
                    x:  triangle.position.x,
                    y:  triangle.position.y,
                    z: triangle.position.z,
                    agent_id:'object_'+object_internal_id,
                    type:'object'
                }]);
             object_internal_id++;
                    this.collision_worker.postMessage([{
                    x:  sphere.position.x,
                    y:  sphere.position.y,
                    z: sphere.position.z,
                    agent_id:'object_'+object_internal_id,
                    type:'object'
                }]);
             object_internal_id++;
                    this.collision_worker.postMessage([{
                    x:  cube.position.x,
                    y:  cube.position.y,
                    z: cube.position.z,
                    agent_id:'object_'+object_internal_id,
                    type:'object'
                }]);
             object_internal_id++;

        }
        
}
function createCube(width,height,deep){
    var geometry = new THREE.BoxGeometry( width, height,deep );
    var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    var cube = new THREE.Mesh( geometry, material );
    return cube;
}
function createSphere(radius, widthSegments, heightSegments){
    var geometry = new THREE.SphereGeometry( radius, widthSegments, heightSegments );
var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
var sphere = new THREE.Mesh( geometry, material );
return sphere;
}
function createTriangle(dimension){

        var extrudeSettings = {
            amount: 1,
            steps: 10,
            bevelSegments: 10,
            bevelSize: 1,
            bevelThickness: 1
        };
        var triangleShape = new THREE.Shape();
        triangleShape.moveTo(0, -dimension);
        triangleShape.lineTo(-dimension, dimension);
        triangleShape.lineTo(dimension, dimension);
        triangleShape.lineTo(0, -dimension);
        return new THREE.Mesh(new THREE.ExtrudeGeometry(triangleShape, extrudeSettings), new THREE.MeshLambertMaterial({
            color: 0x63b8ff
        }));
}

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}