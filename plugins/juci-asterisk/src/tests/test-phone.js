//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
require("../../../../tests/lib-juci"); 

var completed = {
	"call_log": 1, 
	"number_blocking": 1, 
	"ringing_schedule": 0, 
	"speed_dialing": 0, 
	"numbers": 0
}

describe("Phone", function(){
	it("should be completed", function(){
		expect(Object.keys(completed).filter(function(x){ return completed[x] == 0; })).to.be.empty(); 
	}); 
	it("should have a ringing_status section in the config", function(){
		expect($uci.voice_client.ringing_status).to.be.ok(); 
	}); 
}); 
