#!javascript
require("./lib-juci"); 

describe("JUCI", function(){
	it("should have questd installed on router", function(){
		expect($rpc.router).to.be.an(Object); 
		expect($rpc.router.info).to.be.a(Function); 
	});  
	it("should have juci installed on the router", function(){
		// TODO: rename juci stuff to juci
		expect($rpc.juci).to.be.an(Object); 
		expect($rpc.juci.ui.menu).to.be.a(Function); 
	}); 
}); 
