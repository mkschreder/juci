//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

require("../../../../tests/lib-juci"); 
require("./juci.input.port"); 

describe("juciInputPortController", function(){
	var $scope; 
	var IP = "192.168.1.1"; 
	beforeEach(function() {
		$scope = { model: "100-300", portRange: 0 }; 
		controller("juciInputPortController", $scope); 
	});
	it("should correctly read port range from model", function(){
		["1-10", "100-300", "1-4000"].map(function(range){
			$scope.portRange = 1; 
			$scope.model = range; 
			var parts = range.split("-"); 
			//console.log(JSON.stringify($scope)); 
			expect($scope.startPort).to.be(parts[0]); 
			expect($scope.endPort).to.be(parts[1]); 
		});  
	}); 
	it("should not allow invalid port ranges", function(){
		["0-300", "1-100000", "200000-1", "10-1", "300000-400000"].map(function(range){
			$scope.portRange = 1; 
			$scope.model = range; 
			expect($scope.startPort).to.be(""); 
			expect($scope.endPort).to.be(""); 
		});  
	}); 
	it("should not allow single ports out of range", function(){
		["0", "100000", "-10000", "-3000"].map(function(range){
			$scope.portRange = 0; 
			$scope.model = range; 
			expect($scope.port).to.be("");
		});  
	}); 
	it("should not allow negative numbers that look like port ranges", function(){
		["-10000", "-3000"].map(function(range){
			$scope.portRange = 1; 
			$scope.model = range; 
			expect($scope.port).to.be("");
			expect($scope.startPort).to.be(""); 
			expect($scope.endPort).to.be(""); 
		}); 
	}); 
	it("should update port range when values change", function(){
		[["11", "35"], ["200", "400"]].map(function(parts){
			$scope.portRange = 1; 
			$scope.startPort = parts[0]; 
			$scope.endPort = parts[1]; 
			expect($scope.model).to.be(parts[0]+"-"+parts[1]); 
		}); 
	}); 
	it("should not allow invalid numbers to be entered in port range", function(){
		[["0", "1"], ["-1", "30"], ["100000", "400000"]].map(function(parts){
			$scope.portRange = 1; 
			$scope.startPort = parts[0]; 
			$scope.endPort = parts[1]; 
			expect($scope.model).to.be(""); 
		}); 
	}); 
}); 
