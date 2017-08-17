/******************************************************************************************
*******************************************************************************************

                        collision worker - collision_worker.js

******************************************************************************************
******************************************************************************************
    This class can be used only to define database schema , upgrade  and init database
*******************************************************************************************
******************************************************************************************/




this.first_check=false;
//object array with updated position of all objects on scene
this.object_ids=[];

//only agent array to speed_up agent relative position calculation
this.agent_objs=[];

//array with relative position of near agents for each agent
this.agent_relativ_pos={};

//TO-DO: this parameters must be set dinamically from a specific message by the user
var collision_distance=10;
//TO-DO:WIFI Distance must be customized for each agents/object trough a parameter in the dedicated array
var wifi_distance=4000;
var laserFinder_distance=300;
//TO-DO for this parameters additional control on the minimum value must be introduced
var loop_collision_time=4000;
var object_limit=100;

var stub_obj_pos=[{
        x:0,
        y:0,
        z:0,
        type:"N/A",
        object_id:0
}];


this.checkForCollision = function(){
    
    var collision_message=collision_detection(this.object_ids)
    
    if(collision_message!=null &&collision_message.detected){
        console.log("COLLISION DETECTED object 1 ID:"+collision_message.object_id[0]);
        console.log("COLLISION DETECTED object 2 ID:"+collision_message.object_id[1]);
        if(collision_message.type[0]=='agent'){
            setDisabledInList(collision_message.object_id[0]);
        }
        if(collision_message.type[1]=='agent'){
            setDisabledInList(collision_message.object_id[1]);
        }
        
        self.postMessage(collision_message);    
    }

    //check if must be moved to a dedicated cycle with a different delay
    agent_relative_pos_eval(this.object_ids);
    
    setTimeout(function(){checkForCollision()},loop_collision_time);
    //console.log(this.object_ids);
    
}

function init_obj_array(){

    for(var i=0; i<object_limit; i++){

            this.object_ids.push(stub_obj_pos);
    }

}    


self.addEventListener('message', function(e) {
     move_par=e.data;
     var agent_id=move_par[0].agent_id;
     var x=move_par[0].x;
     var y=move_par[0].y;
     var z=move_par[0].z;
     var type=move_par[0].type;

     if(!this.first_check){
         //init_obj_array();
     }

     addRefrObj_pos(agent_id,type,x,y,z);


    if(!this.first_check){
        this.first_check=true;
        checkForCollision(this.object_ids);
         
        //console.log(this.object_ids);
        
     }

}, false);


function collision_detection(object_ids){
   
    for (var i = object_ids.length - 1; i >= 0; i--) {

        //first version disabled agents are not evaluated
        //if(object_ids[i].type=='agent'&&!object_ids[i].disabled){
        //check the collisions/distance only for objects of agent type
        if(object_ids[i].type=='agent'){
            for (var k = object_ids.length - 1; k >= 0; k--) {
                if(object_ids[i].object_id!=object_ids[k].object_id){
                    
                    var distance=evalDistance(object_ids[i].x,object_ids[i].y,object_ids[i].z,object_ids[k].x,object_ids[k].y,object_ids[k].z);
                    if(distance<collision_distance){
                            var collision_message = {
                            detected: true,
                            object_id:[object_ids[i].object_id,object_ids[k].object_id],
                            type:[object_ids[i].type,object_ids[k].type]
                        };
                        console.log("Objects distance: "+ distance);
                        return collision_message
                    }
                }
            }
        }
    }
}

this.setDisabledInList = function (object_id){
    for (var i = this.object_ids.length - 1; i >= 0; i--) {
            if(object_ids[i].object_id==object_id){
                object_ids[i].disabled=true;
                console.log("agent:"+object_id+" DISABLED");
            }
        }
}

this.addRefrObj_pos = function (object_id,type,x,y,z) {
    var found=false;
    var disabled=false;

        // refresh object position (only moving obiject will need throw a msg with a new position)
        //ciclo for al contrario = BESTIA DI SATANA
        for (var i = this.object_ids.length - 1; i >= 0; i--) {
            if(object_ids[i].object_id==object_id){
                found=true;
                disabled=object_ids[i].disabled;
                object_ids[i].x=x;
                object_ids[i].y=y;
                object_ids[i].z=z;
            }
        }

      
        //add object to array
        if(!found&&!disabled){
            var object = {
                x: x,
                y: y,
                z: z,
                object_id:object_id,
                type:type,
                disabled:false
            };
            this.object_ids.push(object);
            console.log("add object:"+object + "to collision worker buffer");

            //add object to agent array
            if(object.type=="agent"){
                this.agent_objs.push(object);
            }
        }

};

function agent_relative_pos_eval(agent_objs){

    /**************************************************************************************
    For each agent all the position of the others agents it's computed and stored in a array.
    The positions array is then sent to the each agent, this capability can be used to 
    simulate a laser-finder sensor or an overlay network through a filter on distance among
    the agents.
    **************************************************************************************/
    
    for (var i = object_ids.length - 1; i >= 0; i--) {
        //reset detected object array
        this.agent_relativ_pos=[];

        //check if the agent is active
        if(!object_ids[i].disabled){
            for (var k = object_ids.length - 1; i >= 0; i--) {
                //check only other agents
                if(object_ids[i].object_id!=object_ids[k].object_id){

                    var distance= evalDistance(object_ids[i].x,object_ids[i].y,object_ids[i].z,object_ids[k].x,object_ids[k].y,object_ids[k].z);
                    
                    //check for wi-fi distance (default simulation of a wi-fi network comm. channel)
                    if(distance<this.wifi_distance){
                        this.agent_relativ_pos.push(object_ids[k]);     
                    }
                }
            }
        }
    
        //check if agent_relativ_pos is not empty
        if(agent_relativ_pos.length>0){

            var detection_message = {
                detected: true,
                //agent_id:object_ids[i].object_id,
                agents_relativ_pos:this.agent_relativ_pos
            };

            //return relative position to the agent
            self.postMessage(detection_message);
            //console.log(detection_message);

        }
        

    }
}

function evalDistance(x1,y1,z1,x2,y2,z2){

         var distance= Math.sqrt( Math.pow((x1 - x2),2) +   Math.pow((y1 - y2),2)  +  Math.pow((z1 - z2),2));
               
         return distance;
}
