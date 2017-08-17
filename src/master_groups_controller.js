/**************************************************************************
************************** MASTER GROUPS CONTROLLER ***********************
***************************************************************************

Master Group Controller that must be used to manage the group controllers.
The Master Group Controller define the Group ID within the same group
controller. The Master Group Controller is only an high level interface 
that can be used by the user to manage the groups in a more organized way


***************************************************************************
***************************************************************************
***************************************************************************/



function master_group_controller(){


this.groups_list=[];
this.group_length=0;

	this.add_group=function(){

		//create a group controller and set the ID (within the same master group controller)
		// and return the created group controller

		var group_id=this.group_length+1;
		var group_temp=new master_group_controller(group_id);

		this.groups_list.push(group_temp);

		return group_temp;
	}


//TO-DO: a master groups controller can be upgraded to automatically create groups by split all the agents on the scene
//and automatically assign a leader

}