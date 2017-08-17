

var db;
var position_store;
var db_name;
var version;
var request;
var db_init=false;






self.addEventListener('message', function(e) {

 		var received_msg=e.data;
 		
		//check msg header
		if (received_msg.message_header!==undefined){

					if (received_msg.message_header=="db_definition_data"){
						//retrieve indexeddb
						console.log("starting db_init on worker");
						db_name=received_msg.database_name;
						retrieve_db();
					}
					
					if ((received_msg.message_header=="save_agent_pos") && (db_init)){
						//save position on indexeddb
						insertPosition(received_msg.agent_pos);
					}
			

		}


 });


 function retrieve_db(){

		request = indexedDB.open(db_name);
		
		request.onerror = function(event) {
				  alert("Why didn't you allow my web app to use IndexedDB?!");
		};
		request.onsuccess = function(event) {
				  db = event.target.result;
				  console.log("indexedDB correctly retrieved from worker.");
				  db_init=true;

		};

 }


 function insertPosition(position){

 	if(db_init){

 		var temp_pos=[{x: position.x,
            y: position.y,
            z: position.z,
            agent_id:position.agent_id,
            ts:position.ts,
            topicMsg:position.topicMsg}];
		
		var transaction =db.transaction(["agent_positions"], "readwrite");

		var objectStore = transaction.objectStore("agent_positions");
		transaction = objectStore.add(temp_pos);

		transaction.oncomplete = function(event) {
		  //console.log("transaction initialized");
		};

		transaction.onerror = function(event) {
		  console.log("error while saving agent position");
		};

		
		
		
		transaction.onsuccess = function(event) {
		    // event.target.result == customerData[i].ssn;
		    console.log("position added!");
		};
	}
		//updateLastPos(position);

}


function updateLastPos(position){

	
	var objectStore = db.transaction(["obj_last_positions"], "readwrite").objectStore("obj_last_positions");
	//var index = objectStore.index("agent_id");

	var transaction = objectStore.get(position.agent_id);


	

	transaction.onerror = function(event) {
	  	//if not present insert the position on db!on error???
	  	
	};

	transaction.onsuccess = function(event) {
	  
	  // Get the old value that we want to update
	  //var data = event.target.result;
	  // update the value(s) in the object that you want to change
	  //data.age = 42;
	   console.log(event.result);

	if(event.result==undefined){
		objectStore.add(position);
		 console.log("position added!");
	}else{
	  // Put this updated object back into the database.
	  var requestUpdate = objectStore.put(position);
	   requestUpdate.onerror = function(event) {
	     // Do something with the error
	   };
	   requestUpdate.onsuccess = function(event) {
	     // Success - the data is updated!
	   };

	   console.log("position updated!");
	  }

	};

}