require("../../../../tests/lib-juci"); 
require("../dropbear"); 

describe("Dropbear", function(){
	it("should have config dropbear and should have settings section named 'settings'", function(){
		expect($uci.dropbear).to.be.ok(); 
		expect($uci.dropbear.settings).to.be.ok(); 
	}); 
}); 
