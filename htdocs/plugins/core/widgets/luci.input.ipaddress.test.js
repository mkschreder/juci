//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

require("../../../../tests/lib-juci"); 
require("./luci.input.ipaddress"); 

describe("luciInputIpAddress", function(){
	var $scope; 
	var IP = "192.168.1.1"; 
	beforeEach(function() {
		$scope = { ngModel: IP }; 
		controller("luciInputIpAddress", $scope); 
	});
	it("should show wan IP address if it exists", function(){
		expect($scope.data.length).to.be(4); 
		IP.split(".").forEach(function(x, i){
			expect($scope.data[i]).to.be(x); 
		});  
	}); 
	it("should set correct ip address on the model when parts are changed", function(){
		$scope.data[0] = "200"; 
		$scope.data[1] = "14"; 
		$scope.data[2] = "11"; 
		$scope.data[3] = "95"; 
		expect($scope.ngModel).to.be("200.14.11.95"); 
	}); 
}); 
