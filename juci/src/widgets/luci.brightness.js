//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("luciBrightness", function(){
	var plugin_root = $juci.module("core").plugin_root; 
	return {
		// accepted parameters for this tag
		scope: { 
			model: "=ngModel", 
			min: "@", 
			max: "@", 
			ngChange: "&"
		}, 
		templateUrl: plugin_root+"/widgets/luci.brightness.html", 
		replace: true, 
		controller: "luciBrightness"
	}; 
})
.controller("luciBrightness", function($scope){
	$scope.bars = []; 
	
	//if($scope.model == undefined) $scope.model = new Number(0); 
	if($scope.min == undefined) $scope.min = 0; 
	if($scope.max == undefined) $scope.max = 100; 
	var min = $scope.min; var max = $scope.max; 
	var total = (max - min); 
	var step = total / 5; 
	var base_color = "ff";  
	var last_value = $scope.model; 
	
	function update(){
		var bars = []; 
		if($scope.model < min) $scope.model = min; 
		if($scope.model > max) $scope.model = max; 
		for(var i = step; i <= total; i += step){
			var bar = {color: "f00", value: i}; 
			if(i <= $scope.model) 
				bar.color = base_color+("0000"+Math.round(65535 - 65535*((i) / total)).toString(16)).slice(-4); 
			else 
				bar.color = "eee"; 
			//console.log("value: "+$scope.model+" "+bar.color); 
			bars.push(bar); 
		}
		setTimeout(function(){
			if($scope.model !== last_value && $scope.ngChange) {
				last_value = $scope.model;
				$scope.ngChange();  
			}
		}, 0); 
		$scope.bars = bars; 
	} update(); 
	
	$scope.$watch("model", function(value){
		update(); 
	}); 
	
	$scope.onDecrease = function(){
		$scope.model -= step; 
		update(); 
	}
	
	$scope.onIncrease = function(){
		$scope.model += step; 
		update(); 
	}
	$scope.onBarClick = function(bar){
		$scope.model = bar.value; 
		update(); 
		console.log("Changed value to "+bar.value); 
	}
}); 
