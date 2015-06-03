require("../../../../tests/lib-juci"); 

var completed = {
	"about": 1, 
	//"diagnostics": 0, 
	"events": 1, 
	"nat": 1, 
	"restart": 1, 
	"status.dsl": 1, 
	"status.status": 1, 
	"status.tv": 1, 
	"status.voice": 1
}

describe("Status", function(){
	it("should be completed", function(){
		expect(Object.keys(completed).filter(function(x){ return completed[x] == 0; })).to.be.empty(); 
	}); 
	it("should have router.info rpc call", function(){
		expect($rpc.router).to.be.ok(); 
		expect($rpc.router.info).to.be.ok(); 
	}); 
	it("should have accessible router.igmptable call", function(){
		expect($rpc.router).to.be.ok(); 
		expect($rpc.router.igmptable).to.be.ok(); 
		$rpc.router.igmptable()
			.done(function(){ done(); })
			.fail(function(){ }); 
	}); 
	it("should have correct boardpanel.network settings", function(done){
		$rpc.network.interface.dump().done(function(results){
			expect(results.interface).to.be.ok(); 
			var devs = results.interface.map(function(x){ return x.interface; }); 
			expect(devs).to.contain($uci.boardpanel.network.internet.value); 
			expect(devs).to.contain($uci.boardpanel.network.voice.value); 
			expect(devs).to.contain($uci.boardpanel.network.iptv.value); 
			done(); 
		}); 
	}); 
}); 
