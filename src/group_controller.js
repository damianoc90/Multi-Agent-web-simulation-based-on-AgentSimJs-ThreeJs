/**************************************************************************
************************** GROUP CONTROLLER *******************************
***************************************************************************

Generic Group Controller that must be used to manage a group of agents.
Each group require a dedicated group controller.
NB:for complex and computational expensive group management operation a 
dedicate worker must be coupled

***************************************************************************
***************************************************************************
***************************************************************************/ 

function group_controller(group_id){


this.group_id=group_id;
this.group_members=[];
this.group_leader_id=0;
this.lader_defined=false;


this.add_agent=function (agent,is_leader){
    //Add a new agent to the group 
    //check if the agent it's already in the group
    var agent_already_in=false;
    var agent_already_in_id=0;
    for(var j=0;j<group_members.length;j++){

            if(group_members[j].id==agent.id){
                agent_already_in=true;
                agent_already_in_id=j;
            }
    }

    if(!agent_already_in){

        //set the agent group
        agent.group=group_id;

        //set the agent as group leader if needed
        if(is_leader){
            agent.leader=1;
        }

        //add agent in the group it's if not present
        group_members.push(agent);
    }


    //if the agent is already present and must be set as leader call change leader function
    if((agent_already_in) && (is_leader)){
        this.change_leader(agent_already_in_id);
        this.lader_defined=true;
    }

}


this.change_leader=function(new_leader_id){

    var leader_set=false;
    //this function is used to change the leader within the group

    for(var j=0;j<group_members.length;j++){

            if(group_members[j].id==this.group_leader_id){
                group_members[j].leader=0;
                this.lader_defined=false;
            }

             if(group_members[j].id==new_leader_id){
                group_members[j].leader=1;
                leader_set=true;
            }
    }

    if(leader_set){
        this.lader_defined=true;
        this.group_leader_id=new_leader_id;
    }
    

} 

this.autochoose_leader()=function(){
    //this function is used to define automatically a leader picking the one with the lowest ID

        var agend_id=group_members[0];
        var array_index=0;

        //find the agent with the lower ID
        for(var j=0;j<group_members.length;j++){
            //override any previous leader selection
            group_members[j].leader=0;
            if(group_members[j].agend_id<agend_id){
                agend_id=group_members[j].agend_id;
                array_index=j;
            }

        }

        //set the agent with the lower ID as a Leader
        group_members[array_index].leader=1;
        this.group_leader_id=agend_id;
        this.lader_defined=true;


}

this.select_agent=function(){
    //this method can be overrided by the group leader
     for(j=0;j<group_members.length;j++){

        /********/
    }

}




}