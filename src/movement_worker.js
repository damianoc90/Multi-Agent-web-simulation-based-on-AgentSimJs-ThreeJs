/******************************************************************************************
*******************************************************************************************

						    movement worker - movement_worker.js

******************************************************************************************
******************************************************************************************
		This class is used to manage the agent movements on the scene in 
		a centralized/decentralized way
*******************************************************************************************
******************************************************************************************/



var move_par;
var timer_step=0,t_range=0;
var stop_depo=false;
var x,y,z,x_t,y_t,z_t,type,radius,vector;

var agents_splines=[];//new Array();
var stop_agent=false;
var agent_list=[];
var timer_started=false;
var centralized_mov_worker=false;

this.spline;

self.importScripts('../js/bin/three.min.js');
self.importScripts('../js/bin/threex.domevent.js');
self.importScripts('../js/bin/OrbitControls.js');

self.importScripts('../src/message_list.js');


function EvalNewPositionSpline(){

	//Main method to move the agent alogn the route	through dedicated or centralized worker

		for (var k=0;k<agents_splines.length;k++){
		
          
            var point_number=agents_splines[k].point_number ;

            var spline_index=agents_splines[k].spline_index;

            spline_index++;
            agents_splines[k].spline_index=spline_index;


            var up = new THREE.Vector3( 0, 1, 0);
			var down = new THREE.Vector3( 0, -1, 0);
			var xz = new THREE.Vector3( 0, 1, 0);
			var axis = new THREE.Vector3( );
			var pt, radians, tangent;

			var route_to_go=[];	
			var spline;

			

			if((agents_splines[k].motion_status=="move_around") && (agents_splines[k].motion_mode=="circular")) {


				//skip first point of the array that was the last position of the agent before the circular motion aroun point
				for (var j=1;j<agents_splines[k].path_point_data.length;j++){
					route_to_go.push(new THREE.Vector3(agents_splines[k].path_point_data[j].x, agents_splines[k].path_point_data[j].y, agents_splines[k].path_point_data[j].z));
				}

				//agents_splines[k].path_point_data=route_to_go;
				
				 spline=new THREE.CatmullRomCurve3(route_to_go);


			}

			if (agents_splines[k].motion_status=="init"){

					//if the motion is circular in the first iteration the entry point of the circumference must be reached
					//after entering in the first point of the circumference the agents can switch its motion_status to "move_around" in the next if cycle
					if(agents_splines[k].motion_mode=="circular"){
						for (var i=0;i<2;i++){

							route_to_go.push(new THREE.Vector3(agents_splines[k].path_point_data[i].x, agents_splines[k].path_point_data[i].y, agents_splines[k].path_point_data[i].z));

						}

						spline=new THREE.CatmullRomCurve3(route_to_go);
						//Refresh points subdivision accordingly to new spline length
						agents_splines[k].point_number=agents_splines[k].agent_vel*spline.getLength();

					}else{

						for (var i=0;i<agents_splines[k].path_point_data.length;i++){

							route_to_go.push(new THREE.Vector3(agents_splines[k].path_point_data[i].x, agents_splines[k].path_point_data[i].y, agents_splines[k].path_point_data[i].z));
						}

						 spline=new THREE.CatmullRomCurve3(route_to_go);
					}
	 
			      
			}

         
           
            //when the motion is circular this condition it's verified after the completion of the first path between the agent initial position and the first point 
            //of the circumference
	        if((spline_index >= point_number) && (agents_splines[k].motion_mode=="circular")){
	        	//reset the point index in case of continuos circular motion
	        	agents_splines[k].spline_index=0;
	        	spline_index=0;	

	        	var route_to_go=[];
	        	
	        	for (var j=1;j<agents_splines[k].path_point_data.length;j++){
					route_to_go.push(new THREE.Vector3(agents_splines[k].path_point_data[j].x, agents_splines[k].path_point_data[j].y, agents_splines[k].path_point_data[j].z));
				}

					
				spline=new THREE.CatmullRomCurve3(route_to_go);
				
				agents_splines[k].point_number=agents_splines[k].agent_vel*spline.getLength(); 
				point_number=agents_splines[k].point_number;

				agents_splines[k].motion_status="move_around";

				if(!centralized_mov_worker){

					 setTimeout(EvalNewPositionSpline.bind(null),10);
					 timer_started=true;

				}

	        }else{
	        			            			
	           		//check if the path is completed
			        if ((spline_index <= point_number) && (agents_splines[k].agent_status=="run")) {
			              
				            var agentPos = spline.getPoint(spline_index / point_number);			            
				            // get the tangent to the curve
				            tangent = spline.getTangent(spline_index/ point_number ).normalize();
				            // calculate the axis to rotate around
				            axis.crossVectors( up, tangent ).normalize();
				            // calcluate the angle between the up vector and the tangent
				            radians = Math.acos( up.dot( tangent ) ) - Math.PI;
				              var agent_pos_info=[{
				              		agent_id:agents_splines[k].agent_id,
				            	    x : agentPos.x,
				            		y : agentPos.y,
				           			z : agentPos.z,
				           			tangent:tangent,
				           			axis:axis,
				           			radians:radians
				            }];

				          
				            self.postMessage(agent_pos_info);

				            if(!centralized_mov_worker){
						        setTimeout(EvalNewPositionSpline.bind(null),10);
						        timer_started=true;
					        }

			        }else{
			        	//if final path point reached re-init the index and stop the agent
			        	//agents_splines[k].spline_index = 0;
			            //spline_index=0;

			            //******************************************* MOTION LOOP WITH DEDICATED WORKER ******************************************************//
			            //if the worker enter in this condition the agent has reached the final position and another loop can be started to reach the new position
			            //this control is necessary due to avoid duplication of path following: the agent path can be updated when the previous one if finished
			            //if the user want to force the update the agent must be stopped previously with stop_agent method and the re-initialized with the new path.
			            
				            if(!centralized_mov_worker){

			          		  timer_started=false;

			          		}else{
			          			agents_splines[k].agent_status="end";
			          		}
			            
			        }

		       }

    }



    if(centralized_mov_worker){
    		//if the worker is centralized the loop must be continued only outside the FOR loop
    		//instead for dedicated worker the loop must be managed by the single agent
			setTimeout(EvalNewPositionSpline.bind(null),10);
			timer_started=true;
	}
}




self.addEventListener('message', function(e) {


 	var received_msg=e.data;

 	if (received_msg.topicMsg!==undefined){

 					if (received_msg.topicMsg=="stop_msg"){
 						//stop the selected agent
 						console.log("stop_message received");
 						for(var i=0; i<agents_splines.length; i++){

								if(agents_splines[i].agent_id==received_msg.agent_id){
									agents_splines[i].agent_status="stop";

								}

						}

 					}
					
					if (received_msg.topicMsg=="agent_pos_initspline_msg"){

						if(received_msg.mov_worker_type=="decentralized"){
							centralized_mov_worker=false;
						}else{
							centralized_mov_worker=true;
						}

						
						var agent_find=false;
						var agent_pos_counter=0;

						//route data parsing needed to avoid spline definition problems
						route_to_go=[];	

						for (var k=0;k<received_msg.path_point_data.length;k++){

							route_to_go.push(new THREE.Vector3(received_msg.path_point_data[k].x, received_msg.path_point_data[k].y, received_msg.path_point_data[k].z));
						}

 			 			received_msg.spline=new THREE.CatmullRomCurve3(route_to_go);

						for(var i=0; i<agents_splines.length; i++){

								if(agents_splines[i].agent_id==received_msg.agent_id){
									agent_find=true;
									agent_pos_counter=i;
								}

						}

						received_msg.point_number=received_msg.agent_vel*received_msg.spline.getLength();
					
						if(agent_find){
							//if the agent is defined re-init the splines
							
									if((!timer_started)&&(!centralized_mov_worker)){
										agents_splines[agent_pos_counter].agent_status="run";
										agents_splines[agent_pos_counter].agent_vel= received_msg.agent_vel;
								        agents_splines[agent_pos_counter].spline_index= 0;
								        //agents_splines[agent_pos_counter].spline_len= received_msg.spline_len;
								        agents_splines[agent_pos_counter].point_number=received_msg.point_number;
								        agents_splines[agent_pos_counter].path_point_data=route_to_go;
								        agents_splines[agent_pos_counter].spline=received_msg.spline;
								        agents_splines[agent_pos_counter].ts=received_msg.ts;
								        agents_splines[agent_pos_counter].motion_mode=received_msg.motion_mode;
								        agents_splines[agent_pos_counter].motion_status=received_msg.motion_status;
							        }else{
										if(agents_splines[agent_pos_counter].agent_status!="run"){
											agents_splines[agent_pos_counter].agent_status="run";
											agents_splines[agent_pos_counter].agent_vel= received_msg.agent_vel;
									        agents_splines[agent_pos_counter].spline_index= 0;
									        agents_splines[agent_pos_counter].point_number=received_msg.point_number;
									        agents_splines[agent_pos_counter].path_point_data=route_to_go;
									        agents_splines[agent_pos_counter].spline=received_msg.spline;
									        agents_splines[agent_pos_counter].ts=received_msg.ts;
									        agents_splines[agent_pos_counter].motion_mode=received_msg.motion_mode;
									        agents_splines[agent_pos_counter].motion_status=received_msg.motion_status;
										}							        	
							        }
									
						}else{
							
							agents_splines.push(received_msg);
						}


						
						if((!timer_started)&&(!centralized_mov_worker)){
							EvalNewPositionSpline();	
						}else{
							if(!timer_started){
								EvalNewPositionSpline();
								timer_started=true;
							}
						}
					
						

					}
	}
 	

}, false);




//************************ OLD APPROACH THAT MUST BE CHECKED FOR PROJECTILE MOTION!	! ****************************//


/*
self.addEventListener('message', function(e) {
 	

 	move_par=e.data;
 	timer_step=move_par[0].dt;
 	var agent_id=move_par[0].agent_id;
 	var found=false;
 	x=move_par[0].x;
 	y=move_par[0].y;
 	z=move_par[0].z;
 	if(move_par[0].type!==undefined&&move_par[0].type!=null&&move_par[0].type!=''&&move_par[0].type=='circular_motion'){
		type=move_par[0].type;
		radius=move_par[0].radius;
 	}else if(move_par[0].type!==undefined&&move_par[0].type!=null&&move_par[0].type!=''&&move_par[0].type=='projectile_motion'){
		type=move_par[0].type;
		vector=move_par[0].vector;
 	}
 	EvalNewPosition(x,y,z,agent_id,type,radius,vector,timer_step);

}, false);*/

function EvalNewPosition(xi,yi,zi,agent_id,type,radius,vector,timer_step){

	//console.log("Eval New Position!");

	this.timer=timer_step;
	
	var new_position=[];

	if(type!==undefined&&type=='circular_motion'){

		var test =orbitCalculationByRadius(radius);
        test.y=yi;
        this.x=xi+test.x;
		this.y=test.y;
		this.z=zi+test.z;
		new_position=[{x:this.x,y:this.y,z:this.z,delta:0.5,agent_id:agent_id}];
	}else if(type!==undefined&&type=='projectile_motion'){
		var result =projectileCalculation(vector);
      
        this.x=xi+result.x;
		this.y=yi+result.y;
		this.z=zi+result.z;
		new_position=[{x:this.x,y:this.y,z:this.z,delta:0.5,agent_id:agent_id,vector:result.vector}];
	}else{
		this.x=xi +1;
		this.y=yi +1;
		this.z=zi +1;
		new_position=[{x:this.x,y:this.y,z:this.z,delta:0.5,agent_id:agent_id}];
	}
	

	//console.log(new_position);
	//setTimeout(	function(){self.postMessage(new_position)},this.timer);

	//self.postMessage(new_position);
	//setTimeout(EvalNewPosition.bind(null,x,y,z,agent_id,timer),this.timer);
}




	function orbitCalculationByRadius(radius) {
    	return {x: (Math.sin((Date.now()%6000)/6000 * Math.PI * 2) * radius),
            z: (Math.cos((Date.now()%6000)/6000 * Math.PI * 2) * radius)};
	}		

	function projectileCalculation(vector) {
  		
		
		var dt = 0.13;
		var a=-9.8;
	 	var new_x =  vector.x * dt;
       			
		var new_z = vector.z * dt;
		var new_y =  vector.y * dt + 0.5 * a * Math.pow(dt,2);
		
		return {x:new_x,y:new_y,z:new_z,vector:vector};

	}