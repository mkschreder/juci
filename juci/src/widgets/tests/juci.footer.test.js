//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

require("../../../../tests/lib-juci"); 
require("./juci.footer"); 

describe("juciFooter", function(){
	var $scope; 
	beforeEach(function() {
		$scope = { }; 
		controller("juciFooter", $scope); 
	});
	it("should show wan IP address if it exists", function(done){
		$rpc.network.interface.dump().done(function(result){
			var wan; 
			result.interface.map(function(x){ if(x.interface == "wan") wan = x; }); // TODO: change to real way to get wan data
			if(wan && wan["ipv4-address"]) expect($scope.wanip).to.be(wan["ipv4-address"][0].address); 
			else console.log("No wan interface present!"); 
			done(); 
		}); 
	}); 
}); 
