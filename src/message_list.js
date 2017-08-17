
/*********************************************************************************************************************
**********************************************************************************************************************
This file define all the default message of AgentSimJs WARNING: DO NOT modify the messages marked as "DEFAULT-MESSAGE" 
without updating accordingly the related classes that use these messages.
**********************************************************************************************************************
*********************************************************************************************************************/

///*****DEFAULT-MESSAGE******///
var agent_pos_msg = [{
            x: 0,
            y: 0,
            z: 0,
            agent_id:0,
            ts:"",
            topicMsg:"agent_pos_msg"
 }];

///*****DEFAULT-MESSAGE******///
 var agent_spline_init_msg = [{
            agent_vel: 0,
            spline_index: 0,
            point_number: 0,
            spline_len:0,
            agent_id:0,
            ts:"",
            path_point_data:0,
            spline:0,
            agent_status:"run",
            motion_mode:"foward",
            motion_status:"init",
            topicMsg:"agent_pos_initspline_msg",
            mov_worker_type:"decentralized"
 }];

///*****DEFAULT-MESSAGE******///
var path_point_data=[{
      x:0,
      y:0,
      z:0  
}];

///*****DEFAULT-MESSAGE******///
var agent_stop = [{
            agent_id:0,
            ts:"",
            topicMsg:"stop_msg"
 }];

///*****DEFAULT-MESSAGE******///
var save_agent_pos_msg = [{
            agent_pos:{ x: 0,
            y: 0,
            z: 0,
            agent_id:0,
            ts:"",
            topicMsg:"agent_pos_msg"},
            message_header:"save_agent_pos"

 }];

///*****DEFAULT-MESSAGE******///
var db_definition_msg = [{
            database_name: "db_name",
            message_header:"db_definition_data"
 }];


///*************************DEFAULT-MESSAGE*************************/// TO-DO:Verify if duplicated
//This message can be modified by specify the Hostname and the port of the MQTT Broker
 var mqtt_broker_conn=[{
 		topicMsg:"broker_managment",
 		hostname:"noname",
 		port:"",
 		command:""
 }];

///*****DEFAULT-MESSAGE******///Verify if duplicated
//This message can be modified by specify the Hostname and the port of the MQTT Broker
 var mqtt_broker_conn_start=[{
 		topicMsg:"mqtt_conn_management",
 		hostname:"noname",
 		port:"",
 		command:"open_connection" //others comm: close_connection
 }];

///*****DEFAULT-MESSAGE******///
var broadcast_message=[{
	 agent_broadcast:"0",
	 msg_payload:[]
}];



/*************************************************************************************************
**************************************************************************************************
**************************************************************************************************
The following messages can be modified and customized by the users withot affecting AgentsSimJS 
classes.

NB:Some messages are related to the simulation on test scene, deleting some fields/messages can
affect the test-scene provided
**************************************************************************************************
**************************************************************************************************
*************************************************************************************************/


//message to assign inspection task to a single agent
var agent_insp_task_msg = [{
            target_x: 0,
            target_y: 0,
            target_z: 0,
            destination_agent_id:0,
            source_agent_id:0,
            ts:"",
            topicMsg:"agent_insp_task_msg"
 }];

var req_insp_msg = [{
            target_x: 0,
            target_y: 0,
            target_z: 0,
            source_agent_id:0,
            ts:"",
            topicMsg:"req_insp_msg"
}];


//TO-DO ack message by the leader

