/*****************************************************************************************************************
******************************************************************************************************************                           

                                                agent - agent.js

******************************************************************************************************************
******************************************************************************************************************
The agent class is the main class used in AgentSimJs to simulate a single agent. All the basic function/behaviours
of the agent are defined there. Some methods can be overrided by the user (eg. message received callback function)
in order to customize the agent behaviours. Some basic functionality are defined: path following, circular motion,
plot trajectory, agent geometry.
******************************************************************************************************************
*****************************************************************************************************************/

function Agent(id, type, dimension, displayAxis,mov_worker,movement_type,collision_worker,mov_worker_type) {



	/*****/
    this.displayAxis = displayAxis;
    this.id = id;
    var agent_id=id;
    this.agent_name = "agent_" + this.id;
    //console.log( this.id );
    this.route = [];
  	this.movement_worker=mov_worker;
  	this.spawn_point = [];
    this.agent_object;
    this.movement_type = movement_type;
    this.dimension = dimension;
    this.spline;
    this.spline_index=0;
    this.messagebus_worker;
    //if this attrubute is set as "distributed" each agent will have a dedicated worker - if set as "centralized" only one worker will be used to simulate motion
    this.mov_worker_type=mov_worker_type;   
    //when the variables are shared among threads must be declared as VAR
    var message_bus_internal=true;
    //duplication due to separate thread of the worker
    var msg_bus_worker;
    this.point_number;
    this.indexdb;
    //duplication due to separate thread of the worker
    var indexdb_man;
    var save_pos_onDB=false;
    this.agent_speed=3;
    this.position_msg_delay=100;
    this.collision_worker=collision_worker;
    //duplication due to separate thread of the worker
    var collision_worker=collision_worker;
    this.arrowHelper;
	var disabled=false;
    var agent_obj_2;
    /*****/

    this.type = type;
    this.group = 0;
    this.leader = 0;
    this.start_x = 0;
    this.start_y = 0;
    this.start_z = 0;
    this.starting_rot = 0;

    this.scene_to_spawn = null;
    this.path = []; //probably duplicated

    this.div_log = "";
    this.number_of_sector = 0;
    this.spawned = false;
    this.motion_status="idle";
    //internal variable to store path geometry and manage the geometry on scene
    this.path_geometry;
    this.agent_color="#" +Math.floor(Math.random()*0xff0000).toString(16);


    //------------------------------ BASIC AGENT METHODS ----------------------------//

    this.setCollisionWorker = function() {
         this.collision_worker.postMessage([{
                    x: this.spawn_point.x,
                    y: this.spawn_point.y,
                    z: this.spawn_point.z,
                    agent_id:this.id,
                    type:'agent'
                }]);


        var my_id=this.id;
        this.collision_worker.addEventListener('message', function(e) {
        
                var message=e.data;
                var object_id=message.object_id;
                var type=message.type;
                console.log(my_id+" this.id this.id this.id");
                console.log(message.object_id);
                console.log((object_id[0]!=null&&object_id[0] == my_id));
                console.log((object_id[1]!=null&&object_id[1] == my_id));
                if((object_id[0]!=null&&object_id[0] == my_id) || (object_id[1]!=null&&object_id[1] == my_id) ){

                    disabled=true;
                }

        }, false);
    }



    this.buildAgentTexture = function() {
    //define agent 3D geometry 
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
        this.agent_object = new THREE.Mesh(new THREE.ExtrudeGeometry(triangleShape, extrudeSettings), new THREE.MeshLambertMaterial({
            color: this.agent_color 
        }));

        //0x63b8ff

        this.agent_object.name = this.agent_name;

         if (this.type == 1) {
            this.setColorLeader();
        }else{
            this.setColor(0x0000ff);
        }


        if (!this.spawned) {

            this.scene.add(this.agent_object);
            this.spawned = true;
        } else {
            removeAgent(this.agent_name);
            this.scene.add(this.agent_object);
        }

    }




    this.spawn = function() {
        // create object on scene
        this.buildAgentTexture();
        this.agent_object.position.x = this.spawn_point[0].x;
        this.agent_object.position.y = this.spawn_point[0].y;
        this.agent_object.position.z = this.spawn_point[0].z;


    };

    this.spawnAt = function(x, y, z) {

        // create object on scene at specific location

        this.buildAgentTexture();
        this.agent_object.position.x = x;
        this.agent_object.position.y = y;
        this.agent_object.position.z = z;
        //this.agent_object.rotation.z=Math.PI/4;
        this.starting_rot = this.agent_object.rotation.z;

    };


     this.setRoute = function(route) {
        //this.agent_object.rotation.z=300 * Math.PI/180;
        console.log(route);
        this.route = route;
    }


     this.moveToStartLocation = function() {
        //old methods deleted - can be reused for specific purpouse
    
    }

    this.setColorLeader = function() {
        this.agent_object.material.color.setHex(0xff0000);
        this.agent_color=0xff0000;
    };

    this.setColor = function(color_hex) {
        this.agent_object.material.color.setHex(color_hex);
        this.agent_color=color_hex;
    };

    this.setRandomColor=function(){
        this.agent_color="0x" +Math.floor(Math.random()*0xff0000).toString(16);
        this.agent_object.material.color.setHex(this.agent_color);
    }

    this.setDivLog = function(div_to_log) {
        this.div_log = "#" + div_to_log;
    };

    this.setScene = function(scene_in) {
        this.scene = scene_in;
    };

    this.setSectorNumber = function(sectors) {
        this.number_of_sector = sectors;
    };

    this.setSpawnPoint = function(spawn_point) {
        this.spawn_point = spawn_point;
    };

    this.setPath = function(path_array) {
        this.path = path_array;
    };

    function setPosition(x, y, z) {
        this.agent_object.position.x = x;
        this.agent_object.position.y = y;
        this.agent_object.position.z = z;

    }

    function removeAgent(name) {
        var selectedObject = this.scene.getObjectByName(name);
        this.scene.remove(selectedObject);
        //renderSimsArea();
    }

    function writeConsoleLog(s){
        if(true){
                console.log(s);
            }
    }


    //----- Spline movement Methods-----//

    this.initSplineTraj= function(route){

        agent_obj_2=this.agent_object;

        //this.sendPositionPeriodically();
        var mov_type="foward";
        initSplineTraj(route,this.movement_worker,this.agent_speed,mov_type,this.motion_status,this.mov_worker_type);
        this.motion_status="run";

        //if the route it's not cleaned up all the position history will plot by the plotTrajectory method
        this.route=[];

        for(var j=0; j<route.length;j++){

                this.route.push(new THREE.Vector3( route[j].x , route[j].y,route[j].z));
        }

    }

   function initSplineTraj(route,movement_worker,agent_speed,mov_type,motion_status,mov_worker_type){



      
        var temp_agent_spline_init_msg=agent_spline_init_msg;
        var path_point=path_point_data;
        temp_agent_spline_init_msg.agent_vel= agent_speed;
        temp_agent_spline_init_msg.spline_index=0;
        temp_agent_spline_init_msg.agent_id=agent_obj_2.id;
        temp_agent_spline_init_msg.ts=Date.now();
        temp_agent_spline_init_msg.topicMsg="agent_pos_initspline_msg";
        temp_agent_spline_init_msg.path_point_data=[];
        temp_agent_spline_init_msg.agent_status="run";
        temp_agent_spline_init_msg.motion_status="init";
        temp_agent_spline_init_msg.motion_mode=mov_type;
        temp_agent_spline_init_msg.mov_worker_type=mov_worker_type;



        for(var j=0; j<route.length;j++){


                var path_point= new Object();
                path_point.x=route[j].x;
                path_point.y=route[j].y;
                path_point.z=route[j].z;
                //assuming priority is related to the array index
                //path_point.point_priority=j;
                temp_agent_spline_init_msg.path_point_data.push(path_point);
                
        }


        
        //console.log(" temp_agent_spline_init_msg ");
        //console.log( temp_agent_spline_init_msg.path_point_data);      
        //console.log("agent " + agent_obj_2.id + " status:" + motion_status);


       /************************************************************
        The listener must be initialized only the first time to 
        avoid multiple agent representation and performace depletion!!

       *************************************************************/ 
       
       if(motion_status!="run"){

        console.log("agent " + agent_obj_2.id + " listener initiated");

         movement_worker.addEventListener('message', function(e) {
              
            var received_msg=e.data;


            if(received_msg[0].agent_id==agent_obj_2.id){
                  
                    agent_obj_2.position.x = received_msg[0].x;
                    agent_obj_2.position.y = received_msg[0].y;
                    agent_obj_2.position.z = received_msg[0].z;

                    var axis=received_msg[0].axis;
                    var radians=received_msg[0].radians;
                   
                    //rotate rotation axis  
                    //agent_obj_2.quaternion.setFromAxisAngle( axis, radians );
                   
                    //agent compensation on roll axis
                    //agent_obj_2.rotateY(-(Math.PI - agent_obj_2.rotation.z));

                    //agent_obj_2.send_position_message();

                    if(message_bus_internal){

                         send_position_message(agent_obj_2,agent_id);
                    }

                   

            }

          },true);

            this.motion_status="run";

        }

        //******Sending init/update path to movement worker**********//

        movement_worker.postMessage(temp_agent_spline_init_msg);


    }


    this.stop_agent=function(){

        //send message to movement worker to stop the agent

        var ag_stop=agent_stop;
        //the agent id object on Threejs list it's different from the assigned by the User
        ag_stop.agent_id=this.agent_object.id;
        ag_stop.topicMsg="stop_msg";

        this.movement_worker.postMessage(ag_stop);
    }

    this.sendPositionPeriodically=function(time_int){

        if(time_int!=undefined){
            try{
                if(time_int>100){
                    this.position_msg_delay=time_int;   
                }
            }catch(e){

            }

        }
        console.log(this.position_msg_delay);
        //this function will post position message on communication bus periodically      
        setInterval(this.send_position_message(), this.position_msg_delay);
    }

 
   this.initSplineTraj_render= function(route){
        //use this function if you want to use the renderer to move the agent on scene
        this.spline = new THREE.CatmullRomCurve3(route);
        this.spline.type="catmullrom"
    }

    this.moveForward_Spline= function (scene) {

          //main method to move the agent alogn the route
            this.point_number= this.agent_speed*this.spline.getLength() ;

            this.spline_index++;
            
            if ( this.spline_index > this.point_number) {
               this.spline_index = 0;
            }
         

            var up = new THREE.Vector3( 0, 1, 0);
            var down = new THREE.Vector3( 0, -1, 0);
            var xz = new THREE.Vector3( 0, 1, 0);
            //var agent_rot = new THREE.Vector3( 0, 1, 0);
            var axis = new THREE.Vector3( );
            var pt, radians, tangent;

            var agentPos = this.spline.getPoint( this.spline_index / this.point_number);

            this.agent_object.position.x = agentPos.x;
            this.agent_object.position.y = agentPos.y;
            this.agent_object.position.z = agentPos.z;

            // get the tangent to the curve
            tangent = this.spline.getTangent( this.spline_index/ this.point_number ).normalize();
            
            // calculate the axis to rotate around
            axis.crossVectors( up, tangent ).normalize();
            // calcluate the angle between the up vector and the tangent
            radians = Math.acos( up.dot( tangent ) ) - Math.PI;

            var deg = ((radians + Math.PI) * 180)/Math.PI;

            //console.log("angle between the up vector and the tangent: " + deg);
            
            // set the quaternion
            this.agent_object.quaternion.setFromAxisAngle( axis, radians );
            //rotate rotation axis
            var angle = Math.acos( up.dot( tangent ) );
            

            deg = ((this.agent_object.rotation.y + Math.PI) * 180)/Math.PI;

            //agent compensation on roll axis
            this.agent_object.rotateY(-(Math.PI - this.agent_object.rotation.z));

            this.send_position_message();


    }



     //-------- Circular Motion with Spline traj --------//

     this.findPointOnCircumference=function(center){

        //find point_n on circumference centered in "center" with the selected radius and y_height 
        var point_n= 10;
        var radius = 100;
        var y_height = 150;
        this.route=[];

        //starting point from agent_position
        this.route.push(new THREE.Vector3( this.agent_object.position.x ,this.agent_object.position.y, this.agent_object.position.z));

        for (var i=1;i<=point_n;i++){

            var x=center.x + radius*Math.sin((2*Math.PI/point_n)*i);
            var z=center.z + radius*Math.cos((2*Math.PI/point_n)*i);

            this.route.push(new THREE.Vector3( x , y_height, z));

        }

        //close the ring
        this.route.push(this.route[1]);
        console.log(this.route);
     }

     this.moveAroundPoint=function(){
        agent_obj_2=this.agent_object;
        var mov_type="circular";
        initSplineTraj(this.route,this.movement_worker,this.agent_speed,mov_type);

     }



     //--------------------------------------------------//

     //----- End Spline movement Methods-----//


    function ThreeDDistance(x1,y1,z1,x2,y2,z2){

         var distance= Math.sqrt( Math.Pow((x1 - x2),2) +   Math.Pow((y1 - y2),2)  +  Math.Pow((z1 - z2),2));
               
         return distance;
    }


    /********* TO-DO: fix agent's axis dynamic plot!!!!! ****************/
    function refreshAgentPlotPosition(agent,id, scene,showAxis) {

        if (showAxis) {
        	
           scene.getObjectByName("x_"+id).position.setX(agent.position.x);
            scene.getObjectByName("x_"+id).position.setY(agent.position.y);
            scene.getObjectByName("x_"+id).position.setZ(agent.position.z);
		
            scene.getObjectByName("y_"+id).position.setX(agent.position.x);
            scene.getObjectByName("y_"+id).position.setY(agent.position.y);
            scene.getObjectByName("y_"+id).position.setZ(agent.position.z);
 	
        
            scene.getObjectByName("z_"+id).position.setX(agent.position.x);
            scene.getObjectByName("z_"+id).position.setY(agent.position.y);
            scene.getObjectByName("z_"+id).position.setZ(agent.position.z);


        }


    }

    this.plotAgentAxes = function() {
        if (this.displayAxis) {
            var material_line = new THREE.LineBasicMaterial({
                color: 0xff0000
            });
            var geometry_line = new THREE.Geometry();
            var line_s;


            /*var vector_xs =  new THREE.Vector3(this.agent_object.position.x ,this.agent_object.position.y,this.agent_object.position.z);
            var vector_xend =  new THREE.Vector3(this.agent_object.position.x + 20,this.agent_object.position.y,this.agent_object.position.z);*/

            var vector_xs = new THREE.Vector3(0, 0, 0);
            var vector_xend = new THREE.Vector3(20, 0, 0);

            /* var vector_zs =  new THREE.Vector3(this.agent_object.position.x ,this.agent_object.position.y,this.agent_object.position.z);
             var vector_zend =  new THREE.Vector3(this.agent_object.position.x ,this.agent_object.position.y,this.agent_object.position.z + 20);*/

            var vector_ys = new THREE.Vector3(0, 0, 0);
            var vector_yend = new THREE.Vector3(0, 0, 20);

            var vector_zs = new THREE.Vector3(0, 0, 0);
            var vector_zend = new THREE.Vector3(0, -20, 0);

            
            //vector_xs.applyAxisAngle( axis, angle );
            //vector_xend.applyAxisAngle( axis, angle );

            /*vector_zs.applyAxisAngle( axis, angle );
            vector_zend.applyAxisAngle( axis, angle );*/
            geometry_line.vertices.push(
                vector_xs,
                vector_xend
            );


            line_s = new THREE.Line(geometry_line, material_line);

            line_s.name = "x_"+this.id;
            //line_s.rotation.set(0,angle,0);
            var axisx = new THREE.Vector3(0, 1, 0);
            var anglex = this.agent_object.rotation.z;
            line_s.rotateOnAxis(axisx, anglex);
            line_s.position.setX(this.agent_object.position.x);
            line_s.position.setY(this.agent_object.position.y);
            line_s.position.setZ(this.agent_object.position.z);
            //line_s.position.copy(vector_xs);

            //line_s.matrix.setPosition(this.agent_object.position.x ,this.agent_object.position.y,this.agent_object.position.z);
            //line_s.matrixAutoUpdate = false;
            //line_s.updateMatrix();
            this.scene.add(line_s);

            geometry_line = new THREE.Geometry();
            material_line = new THREE.LineBasicMaterial({
                color: 0x00ff00
            });
            geometry_line.vertices.push(
                vector_ys,
                vector_yend
            );

            line_s = new THREE.Line(geometry_line, material_line);
            var axisy = new THREE.Vector3(0,1, 0);
            var angley = this.agent_object.rotation.z;
            line_s.rotateOnAxis(axisy, angley);
            line_s.position.setX(this.agent_object.position.x);
            line_s.position.setY(this.agent_object.position.y);
            line_s.position.setZ(this.agent_object.position.z);
            line_s.name = "y_"+this.id;

            this.scene.add(line_s);


            var axis = new THREE.Vector3(0, 1, 0);
            var angle =0;// this.agent_object.rotation.x;


            geometry_line = new THREE.Geometry();
            material_line = new THREE.LineBasicMaterial({
                color: 0x0000ff
            });
            geometry_line.vertices.push(
                vector_zs,
                vector_zend
            );
            line_s = new THREE.Line(geometry_line, material_line);
            line_s.name = "z_"+this.id;
            
            line_s.rotateOnAxis(axis, angle);
            line_s.position.setX(this.agent_object.position.x);
            line_s.position.setY(this.agent_object.position.y);
            line_s.position.setZ(this.agent_object.position.z);
            this.scene.add(line_s);
        }

    }

   

    

    function refreshAgentPlotRotation(agent,id,scene,route){
            var material_line = new THREE.LineBasicMaterial({
                color: 0xff0000
            });
            var geometry_line = new THREE.Geometry();
            var line_s;


            var vector_xs = new THREE.Vector3(0, 0, 0);
             var vector_xend;
            if(route.x<0){
                  vector_xend = new THREE.Vector3(-20, 0, 0);
             }else{
                   vector_xend = new THREE.Vector3(20, 0, 0);
             }
            geometry_line.vertices.push(
                vector_xs,
                vector_xend
            );
            line_s = new THREE.Line(geometry_line, material_line);

            line_s.name = "x_"+id;
            //line_s.rotation.set(0,angle,0);
            var axisx = new THREE.Vector3(1, 0, 0);
            var anglex = agent.rotation.x;
            line_s.rotateOnAxis(axisx, anglex);
            line_s.position.setX(agent.position.x);
            line_s.position.setY(agent.position.y);
            line_s.position.setZ(agent.position.z);
              
            scene.remove( scene.getObjectByName(line_s.name) );
               scene.add(line_s)



                   var vector_yend;
            if(route.y<0){
                  vector_yend = new THREE.Vector3(0, -20, 0);
             }else{
                   vector_yend = new THREE.Vector3(0, 20, 0);
             }
                geometry_line = new THREE.Geometry();
            material_line = new THREE.LineBasicMaterial({
                color: 0x00ff00
            });
            geometry_line.vertices.push(
                new THREE.Vector3(0, 0, 0),
                vector_yend
            );

            line_s = new THREE.Line(geometry_line, material_line);
            var axisy = new THREE.Vector3(0, 1, 0);
            var angley = agent.rotation.y;
           
            line_s.rotateOnAxis(axisy, angley);
            line_s.position.setX(agent.position.x);
            line_s.position.setY(agent.position.y);
            line_s.position.setZ(agent.position.z);
            line_s.name = "y_"+id;
             scene.remove( scene.getObjectByName(line_s.name) );
            scene.add(line_s);




                   var vector_zend;
            if(route.z<0){
                  vector_zend = new THREE.Vector3(0, 0, -20);
             }else{
                   vector_zend = new THREE.Vector3(0, 0, 20);
             }
                geometry_line = new THREE.Geometry();
            material_line = new THREE.LineBasicMaterial({
                color: 0x0000ff
            });
            geometry_line.vertices.push(
                new THREE.Vector3(0, 0, 0),
                vector_zend
            );

            line_s = new THREE.Line(geometry_line, material_line);
            var axisz = new THREE.Vector3(0, 0, 1);
            var anglez = agent.rotation.z;
            line_s.rotateOnAxis(axisz, anglez);
            line_s.position.setX(agent.position.x);
            line_s.position.setY(agent.position.y);
            line_s.position.setZ(agent.position.z);
            line_s.name = "z_"+id;
             scene.remove( scene.getObjectByName(line_s.name) );
            scene.add(line_s);

                   var axis = new THREE.Vector3(1, 1, 1);
            
            scene.getObjectByName("z_"+id).rotateOnAxis(axis, agent.rotation.z * Math.PI / 180);
            scene.getObjectByName("x_"+id).rotateOnAxis(axis, agent.rotation.x * Math.PI / 180);
            scene.getObjectByName("y_"+id).rotateOnAxis(axis, agent.rotation.y * Math.PI / 180);

    }

   
    
	this.projectile_motion = function(destination) {
		if(destination==null||destination===undefined){
			alert("input non valido");
		}
		if(destination.y<0){
			alert("input non valido");
		}
        projectile_motion(this.agent_object,this.movement_worker,destination,this.id,this.displayAxis,this.scene);

    };

	function projectile_motion (agent,movement_worker,destination,id,displayAxis,scene){
		 agent.up = new THREE.Vector3(0, 0, 1);
		agent.lookAt(destination);
		var v0=100;
		var g=9.8;
		var theta=Math.atan( 
			((Math.pow(v0,2) -  Math.abs(Math.sqrt( Math.pow(v0,4) - (g*((g*Math.pow(destination.x,2))+(2*destination.y*Math.pow(v0,2))	)))))/(g*destination.x))

			);
		console.log(theta+"theta");
		var abs_dest_x=Math.abs(destination.x);
		var abs_dest_y=Math.abs(destination.y);
		var abs_dest_z=Math.abs(destination.z);
		if(abs_dest_x<30){
			abs_dest_x=30;
		}if(abs_dest_z<30){
			abs_dest_z=30;
		}
		var vY =(abs_dest_x+abs_dest_z)/6; // v0 * Math.sin(0.30);//0.52);
		var vX=0;
		var vZ=0;
		/**VYVXVZ servono a definere la 'gittata' della traiettoria**/
		if(destination.x>0){
			vX=abs_dest_x/10;
		}else if(destination.x<0){
			vX=-abs_dest_x/10;
		}
			if(destination.z>0){
			vZ=abs_dest_z/10;
		}else if(destination.z<0){
			vZ=-abs_dest_z/10;
		}
		var dt = 0.13;
		var vel = new THREE.Vector3( vX, vY, vZ );
		var a = new THREE.Vector3( 0, -9.8, 0 );
	
		   var starting_position_par = [{
            x: agent.position.x,
            y: agent.position.y,
            z: agent.position.z,
            agent_id:id,
            vector:vel,
              type:'projectile_motion',
            dt: 200
        }];
        var ydt=0.08;
        movement_worker.postMessage(starting_position_par);

       movement_worker.addEventListener('message', function(e) {
            
				
			  var agent_id = e.data[0].agent_id;
       		 
       		if(agent_id!=null&&agent_id!==undefined&&agent_id==id){
       			var new_pos_x=e.data[0].x;
       			var new_pos_y=e.data[0].y;
       			var new_pos_z=e.data[0].z;

       			agent.position.x = new_pos_x;
				agent.position.y = new_pos_y;
				agent.position.z = new_pos_z;
				
				vel.y = vel.y + a.y * ydt;	
				agent.translateZ(1);
				writeConsoleLog("x:" + agent.position.x + "y:" + agent.position.y + "z:" + agent.position.z);
					
		  	 		var res = [{
	               x: agent.position.x,
		            y: agent.position.y,
		            z: agent.position.z,
		            agent_id:id,
		            vector:vel,
		            type:'projectile_motion',
	            dt: 200
	        	}];
	        	refreshAgentPlotPosition(agent,id,scene, displayAxis);
                  collision_worker.postMessage([{
                    x: agent.position.x,
                    y: agent.position.y,
                    z: agent.position.z,
                    agent_id:id,
                    type:'agent'
                }]);
	        	if(Math.abs(agent.position.x)>=Math.abs(destination.x)&&Math.abs(agent.position.z)>=Math.abs(destination.z)){
	        		console.log("agente arrivato");
	        	}else{
	        		movement_worker.postMessage(res);
	        	}
 			
 			}
        }, false);
	}


    this.plotTrajectory= function(scene){

            //--------less accurate way to plot agent trajectory ------------//

            /*(i=0;i<this.route.length;i++){
                //console.log("i " + i);
                if(i==0){
                    draw_single_line(0,0,0,this.route[i].x,this.route[i].y,this.route[i].z);
                }else{
                    draw_single_line(this.route[i-1].x,this.route[i-1].y,this.route[i-1].z,this.route[i].x,this.route[i].y,this.route[i].z);
                }

                //add a cube on waypoints
                var geometry = new THREE.BoxGeometry( 3, 3, 3 );
                var material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
                var cube = new THREE.Mesh( geometry, material );
                cube.position.x=this.route[i].x;
                cube.position.y=this.route[i].y;
                cube.position.z=this.route[i].z;

                scene.add(cube);

            }*/

            try{
                 var selectedObject = scene.getObjectByName(this.path_geometry.name);
                 scene.remove( selectedObject );
            }catch(Exception){

            }

            var material = new THREE.LineBasicMaterial({
                color:  this.agent_color,
            });
            
            //0xff00f0

            var geometry = new THREE.Geometry();

            var numPoints = 100;

            try{

                 var spline = new THREE.CatmullRomCurve3(this.route);

                 var splinePoints = spline.getPoints(numPoints);

                for(var i = 0; i < splinePoints.length; i++){
                    geometry.vertices.push(splinePoints[i]);  
                }
                
                var line = new THREE.Line(geometry, material);
                line.name="path_geometry" + this.id;
                this.path_geometry=line;
                scene.add(line);

            }catch(Exception){

            }
           

    }


    function draw_single_line(x0,y0,z0,x1,y1,z1){

        //console.log("x1 " + x1);

        var material = new THREE.LineBasicMaterial({
             color: 0x0000ff
        });

        //draw connection
        var geometry = new THREE.Geometry();
        geometry.vertices.push(
            new THREE.Vector3( x0, y0, z0 ),
            new THREE.Vector3( x1, y1, z1 )
        );

        var line = new THREE.Line( geometry, material );
        scene.add( line );

        //draw landmark
        var geometry = new THREE.BoxGeometry( 1, 1, 1 );
        var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        var cube = new THREE.Mesh( geometry, material );
        cube.position.x=x1;
        cube.position.y=y1;
        cube.position.z=z1;
        scene.add( cube );

    }



//--------------- Message Management Methods -------------------------//
    

    this.setMessageBus_Worker= function(message_bus_worker){

        this.messagebus_worker=message_bus_worker;
        msg_bus_worker=message_bus_worker;

    }

    this.setPositionMsgMode=function(msg_pos_mode){

        // if set to FALSE the position message will NOT be sent to the internal msg buffer
        // the default value is TRUE

        message_bus_internal=msg_pos_mode;
    }

    this.send_position_message=function(){
       
        if(message_bus_internal){
            send_position_message(this.agent_object,this.id);
        }else{
        //to-do: insert variable to choose the msg broadcast mechanism
                var temp_position_msg=agent_pos_msg;

                console.log("send_position_message");
                try{

                  //init_pos_message
                  temp_position_msg.x=this.agent_object.position.x;
                  temp_position_msg.y=this.agent_object.position.y;
                  temp_position_msg.z=this.agent_object.position.z;
                  temp_position_msg.agent_id=this.id;
                  temp_position_msg.topicMsg="agent_pos_msg";
                  temp_position_msg.ts=Date.now(); 

                  this.messagebus_worker.postMessage(temp_position_msg);
                  this.savePosition(temp_position_msg);

                }catch(error){
                  console.log(error.message);
                }

        }
       
    }

    function send_position_message(agent,agent_id){

        //to simulate transmission latency or delay to lower the position message sent a counter can be used to skip N position msg

        var temp_position_msg=agent_pos_msg;

        try{

          //init_pos_message
          temp_position_msg.x=agent.position.x;
          temp_position_msg.y=agent.position.y;
          temp_position_msg.z=agent.position.z;
          temp_position_msg.agent_id=agent_id;
          temp_position_msg.topicMsg="agent_pos_msg";
          temp_position_msg.ts=Date.now(); 

          msg_bus_worker.postMessage(temp_position_msg);
          if(save_pos_onDB){
             indexdb_man.insertPosition(temp_position_msg);
          }
         
        collision_worker.postMessage([{
                    x: agent.position.x,
                    y: agent.position.y,
                    z: agent.position.z,
                    agent_id:agent_id,
                    type:'agent'
        }]);


        }catch(error){
          console.log(error.message);
        }

    }

    this.broadcast_message=function(msg_in){

        //this function is used to broadcast the message received by the agent.
        //the id of the agent is addedd to the payload of the message that will be broadcast

        var tmp_broadcast_msg=broadcast_message;
        tmp_broadcast_msg.agent_broadcast=this.id;
        tmp_broadcast_msg.msg_payload=msg_in;
        msg_bus_worker.postMessage(tmp_broadcast_msg);

    }

    this.setMessageListener=function(custom_function){

        //message listener callback defintion 

        if(custom_function==undefined){
           console.log("internal msg processing function for agent:" + this.id);
           this.messagebus_worker.addEventListener('message', function(e) {

              var received_msg=e.data;
              //check topic_msg
              if (received_msg.topicMsg!==undefined){
                processReceivedMessage(received_msg);
                  //check AgentId (TO-DO destination AGENT ID MUST BE CHECKED!!!)
                  if(received_msg.agent_id==agent_id){
                      //console.log("message received by agent "+ agent_id);
                      //console.log(received_msg);
                      //processReceivedMessage(received_msg);
                  }

              }

            });
        }else{
            console.log("custom msg processing function for agent:" + this.id);
            this.messagebus_worker.addEventListener('message', function(e) {

              var received_msg=e.data;
              //check topic_msg
              if (received_msg.topicMsg!==undefined){
                
                    custom_function(received_msg);
                  //check AgentId (TO-DO destination AGENT ID MUST BE CHECKED!!!)
                  if(received_msg.agent_id==agent_id){
                      //console.log("message received by agent "+ agent_id);
                      //console.log(received_msg);
                      //custom_function(received_msg);
                  }

              }

            });

        }


    }



    function processReceivedMessage(message){
      //stub function to be customized to process the message received by the agent
      //console.log(message);

    }

    this.processReceivedMessage=function(message){
        //stub test 
        console.log(message);
    }

    //indexdb functions
    this.setIndexdb=function(indexdb){
         this.indexdb=indexdb;
         indexdb_man=indexdb;

        /*this.indexdb=new indexdb_manager();
        this.indexdb.create_db();
        console.log(this.indexdb);*/

    }

    this.enableSavePosOnDB=function(pos_on_db){
         save_pos_onDB=pos_on_db;
    }
   

    this.savePosition=function(position){

        if(save_pos_onDB){
              this.indexdb.insertPosition(position);
        }      

    }

   

}