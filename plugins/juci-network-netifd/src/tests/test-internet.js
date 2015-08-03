//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
require("../../../../tests/lib-juci"); 

var completed = {
	"dns": 1, 
	"exposed_host": 1, 
	"firewall": 1, 
	"port_mapping": 1
}

describe("Internet", function(){
	it("should be completed", function(){
		expect(Object.keys(completed).filter(function(x){ return completed[x] == 0; })).to.be.empty(); 
	}); 
}); 

describe("UCI.firewall", function(){
	before(function(done){
		$uci.sync("network").done(function(){
			done(); 
		}); 
	}); 
	
	it("should have network config and settings", function(done){
		expect($uci.network).to.be.ok(); 
		expect($uci.network["@all"]).to.not.be.empty(); 
	}); 
}); 
