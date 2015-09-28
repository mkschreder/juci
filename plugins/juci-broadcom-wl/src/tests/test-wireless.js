//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
#!javascript
require("../../../../tests/lib-juci"); 
require("../wifi"); 

var completed = {
	"general": 1, 
	"mac_filter": 1, 
	"schedule": 1, 
	"settings": 1, 
	"wps": 1
}

describe("Wireless", function(){
	it("should be completed", function(){
		expect(Object.keys(completed).filter(function(x){ return completed[x] == 0; })).to.be.empty(); 
	}); 
	it("should have wireless config", function(){
		expect($uci.wireless).to.be.an(Object); 
	}); 
	it("should have hosts config", function(){
		expect($uci.hosts).to.be.ok(); 
	}); 
	it("should have at least one wireless device and interface defined", function(done){
		expect($uci.wireless["@wifi-device"]).to.be.an(Array); 
		expect($uci.wireless["@wifi-iface"]).to.be.an(Array); 
		expect($uci.wireless["@wifi-device"].length).not.to.be(0); 
		expect($uci.wireless["@wifi-iface"].length).not.to.be(0); 
		done(); 
	}); 
	
	it("should have hosts config present", function(done){
		$uci.$sync("hosts").done(function(){
			expect($uci.hosts).to.be.an(Object); 
			done(); 
		}); 
	}); 
	it("should have wps.pbc rpc call", function(){
		expect($rpc.juci.broadcom.wps.pbc).to.be.a(Function); 
	}); 
	it("should have wps.status rpc call", function(){
		expect($rpc.juci.broadcom.wps.status).to.be.a(Function); 
	}); 
}); 
