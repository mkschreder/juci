//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

require("../../../../tests/lib-juci"); 
require("./juci.brightness"); 

describe("juciBrightness", function(){
	var $scope; 
	beforeEach(function() {
		$scope = { model: 50, min: 0, max: 100}; 
		controller("juciBrightness", $scope); 
	});
	it("should be able to decrease brightness", function(){
		var val = $scope.model; 
		$scope.onDecrease(); 
		expect($scope.model).to.be.lessThan(val);
	}); 
	it("should never go below lower limit", function(done){
		while($scope.model > $scope.min){
			$scope.onDecrease(); 
		}
		$scope.onDecrease(); 
		expect($scope.model).to.be($scope.min); 
		done(); 
	}); 
	it("should never go over higher limit", function(done){
		while($scope.model < $scope.max){
			$scope.onIncrease(); 
		}
		$scope.onIncrease(); 
		expect($scope.model).to.be($scope.max); 
		done(); 
	}); 
	it("should be possible to change values by clicking", function(){
		expect($scope.bars).not.to.be.empty(); 
		$scope.bars.map(function(x){
			$scope.onBarClick(x); 
			expect($scope.model).to.be(x.value); 
		}); 
	}); 
}); 
