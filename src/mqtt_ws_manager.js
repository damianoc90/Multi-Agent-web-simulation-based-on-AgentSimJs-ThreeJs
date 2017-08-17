function mqtt_ws_manager(){

this.message_bus_worker;
var connection_status=false;
var message_package=10;
var message_buffer=[];
var counter=0;
var temp_data;
var default_topic="agentSimJs";
var show_df_topic_log=false;

this.setLog_showDf_topic=function(df_topic_show){
        show_df_topic_log=df_topic_show;
}

this.setMsgBus_worker=function(msgbus_wr){

    this.message_bus_worker=msgbus_wr;

    this.message_bus_worker.addEventListener('message', function(e) {

        //console.log(e.data);

        if((e.data.topicMsg=="broker_managment")&&(e.data.command=="connect_toBroker")){
             console.log("connect to broker");
             connectToMqttBroker();
        }else{
              if(counter<message_package){

                 //parsing data to pubblish on MQTT msg bus 
                 var obj = new Object();
                 obj.x = e.data.x;
                 obj.y  = e.data.y;
                 obj.z = e.data.z;
                 obj.agent_id=e.data.agent_id;
                 obj.ts=e.data.ts;   
                 obj.topicMsg=e.data.topicMsg;
                
                message_buffer.push(obj);
                obj=undefined;
                counter++;
              }else{
                 pubblish(default_topic, JSON.stringify(message_buffer), 0, false) ;
                 counter=0;
                 //console.log(e.data);
                 message_buffer=[];
              }
              
           
        }



       
    });
}



console.log("init_message_bus");
		
// Create a client instance
var hostname = "broker.mqttdashboard.com";
var port = 8000;
var client = new Paho.MQTT.Client(hostname, Number(port), "clientId");

/*var hostname = "192.168.1.78";
var port = 1884;
var client = new Paho.MQTT.Client(hostname, Number(port),"/", "clientId");*/





//
// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;


function connectToMqttBroker(){
        // connect the client
            client.connect({
                onSuccess: onConnect
            });

}


// called when the client connects
function onConnect() {
            // Once a connection has been made, make a subscription and send a message.
            console.log("onConnect");
             connection_status=true;
            subscribeDefaultTopic();
           
         
           
}

this.subscribe=function (topic){
    
        var result=false;

        if(connection_status) {
            client.subscribe(topic);
            result=true;
            console.log("Subscription to "+ topic + " completed.");   

        }else{
            console.log("Subscription to "+ topic + " failed.")  ;
        }

        return result;

}
 

function subscribeDefaultTopic(){

     if(connection_status) {
            client.subscribe(default_topic);
            result=true;
            console.log("Subscription to "+ default_topic + " completed.");   
     }

}

        // called when the client loses its connection
function onConnectionLost(responseObject) {
            if (responseObject.errorCode !== 0) {
                console.log("onConnectionLost:" + responseObject.errorMessage);
            }
}

        // called when a message arrives
function onMessageArrived(message) {
            if(show_df_topic_log){
                console.log("Message arrived: topic=" + message.destinationName + ", message=" + message.payloadString);
            }else{
                if(message.destinationName!=default_topic){
                    console.log("Message arrived: topic=" + message.destinationName + ", message=" + message.payloadString);
                }
            }
            
}
        
function pubblish(topic, payload, qos, retain) {

         
        if(!connection_status) {
            console.log("Not connected");
            return false;
        }

       
       
        var message = new Paho.MQTT.Message(payload);
        message.destinationName = topic;
        message.qos = qos;
        message.retained = retain;
        client.send(message);
    }



}