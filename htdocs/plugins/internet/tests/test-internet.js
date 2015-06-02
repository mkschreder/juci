require("../../../../tests/lib-juci"); 

var completed = {
	"dns": 0, 
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
		$uci.sync("firewall").done(function(){
			done(); 
		}); 
	}); 
	it("should have dmz section of type dmz", function(){
		expect($uci.firewall.dmz).to.be.ok(); 
		expect($uci.firewall.dmz[".type"]).to.be("dmz"); 
	}); 
	it("should have dmzhost section of type include", function(){
		expect($uci.firewall).to.have.property("dmzhost"); 
		expect($uci.firewall.dmzhost[".type"]).to.be("include"); 
	}); 
	it("should have Allow-Ping firewall rule set to visible (hidden=0)", function(done){
		var ping_rule = $uci.firewall["@rule"].filter(function(x){ return x.name.value == "Allow-Ping"; }); 
		expect(ping_rule).not.to.be.empty(); 
		if(ping_rule[0].hidden.value != 0) throw new Error("Allow-Ping firewall rule should be configured with hidden=0"); 
	}); 
	it("should have network config and settings", function(done){
		expect($uci.network).to.be.ok(); 
		expect($uci.network["@all"]).to.not.be.empty(); 
	}); 
}); 
