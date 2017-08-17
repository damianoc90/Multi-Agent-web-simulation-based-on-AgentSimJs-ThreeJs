/******************************************************************************************
*******************************************************************************************

						    indexed-db manager - indexdb_manager.js

******************************************************************************************
******************************************************************************************
 	This class can be used only to define database schema , upgrade  and init database
*******************************************************************************************
******************************************************************************************/



function indexdb_manager(){

const db_name="agentsim_db";
const version=2;
var db;
var position_store,last_post_store;
this.indexedDB_worker ={};



	this.create_db=function(){

		this.indexedDB_worker = new Worker("src/indexdb_worker.js");
		
		if (!window.indexedDB) {
		    window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
		}

		var request = indexedDB.open(db_name,version);
		
		request.onerror = function(event) {
		  alert("Why didn't you allow my web app to use IndexedDB?!");
		};
		request.onsuccess = function(event) {
		  db = event.target.result;
		  console.log("indexedDB correctly creadted/retrieved from manager.");
		  //console.log(db);

		};



		request.onupgradeneeded = function(event) {
		  db = event.target.result;
		  position_store = db.createObjectStore("agent_positions", { autoIncrement : true });
		  position_store.createIndex("agent_id", "agent_id", { unique: false });



		  last_post_store = db.createObjectStore("obj_last_positions", { keyPath: "agent_id"});
		  last_post_store.createIndex("agent_id", "agent_id", { unique: true });


		  position_store.transaction.oncomplete = function(event) {
		  	console.log("objectStore agent_positions,obj_last_positions created"); 
		  };
		};


		//send db parameters to worker 
		   var temp_db_definition_msg=db_definition_msg;

			temp_db_definition_msg.database_name=db_name;
			temp_db_definition_msg.message_header="db_definition_data";
			
			this.indexedDB_worker.postMessage(temp_db_definition_msg);


	}


	this.insertPosition=function(position){
		
		/*var transaction =db.transaction(["agent_positions"], "readwrite");
		transaction.oncomplete = function(event) {
		  //alert("All done!");
		};

		transaction.onerror = function(event) {
		  // Don't forget to handle errors!
		};

		var objectStore = transaction.objectStore("agent_positions");
		
		var request = objectStore.add(position);
		request.onsuccess = function(event) {
		    // event.target.result == customerData[i].ssn;
		    console.log("position added!");
		};*/

		
		//incapsulate message and send data to the worker
		 var temp_save_agent_pos_msg= save_agent_pos_msg;
		 temp_save_agent_pos_msg.agent_pos=position;
		 temp_save_agent_pos_msg.message_header="save_agent_pos";

		 //send data to database worker
		 this.indexedDB_worker.postMessage(temp_save_agent_pos_msg);


	}





}