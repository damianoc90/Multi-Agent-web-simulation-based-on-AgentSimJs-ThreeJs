
		

console.log("init_message_bus");

		
self.importScripts('message_list.js');


// Create a MQTT client instance
var conn_msg=mqtt_broker_conn;
conn_msg.command="connect_toBroker";
conn_msg.topicMsg="broker_managment";
	



//proxy message received to everyone
    self.addEventListener('message', function(e) {

			var received_msg=e.data;

			//console.log(e.data);
			//check topic_msg
				if (received_msg.topicMsg!==undefined){
					
					if (received_msg.topicMsg=="mqtt_conn_management"){
						//init connection to MQTT message bus
						self.postMessage(conn_msg);
					}else{
						//proxy message to all the listeners
						self.postMessage(received_msg);
					//console.log(received_msg);
					}
					

				}

	
 	

 	
}, false);


