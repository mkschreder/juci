#!/usr/bin/node

var argv = require("minimist")(process.argv.slice(1)); 
require("./lib-juci"); 

var params = {
	host: argv["s"] || "ws://localhost:1234", 
	method: argv["_"][1],
	object: argv["_"][2],  
	func: argv["_"][3],  
	params: argv["_"][4]  
}; 

function usage(){
	console.log("usage: "+argv["_"][0]+" -s <socket> "); 
	console.log(""); 
}

$rpc2.$connect(params.host).done(function(){ 
	var t = Date.now(); 

	if(params.method == "list"){
		$rpc2.$call("/ubus/peer", "ubus.peer.list", {}).done(function(ret){
			var n = Date.now(); 
			var objects = ret[0]; 
			Object.keys(objects).map(function(k){
				console.log(k);
				Object.keys(objects[k]).map(function(m){
					var str = "\t"+m+" - ["+objects[k][m].filter(function(x){
						// filter input arguments
						return x[0] == 1; 
					}).map(function(x){ return x[1]; }).join(",")+"]"; 
					console.log(str); 
				}); 
			}); 
			console.log("took "+(n - t)+"ms"); 
		}); 
	} else if(params.method == "call" && params.object && params.func && params.params){
		$rpc2.$call(params.object, params.func, JSON.parse(params.params)).done(function(ret){
			var n = Date.now(); 
			console.log(JSON.stringify(ret, null, "  ")); 
			console.log("took "+(n - t)+"ms"); 
		}); 
	} else {
		usage(); 
	}
}); 

