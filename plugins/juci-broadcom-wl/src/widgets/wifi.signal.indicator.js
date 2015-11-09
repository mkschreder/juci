//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("wifiSignalIndicator", function($compile, $parse){
	return {
		templateUrl: "/widgets/wifi.signal.indicator.html", 
		scope: {
			value: "=ngModel"
		}, 
		controller: "wifiSignalIndicator", 
		replace: true, 
		require: "^ngModel"
	 };  
}).controller("wifiSignalIndicator", function($scope, $uci, $rpc){
	$scope.bars = [false, false, false, false]; 
	$scope.$watch("value", function(value){
		var q = value; 
		$scope.bars[0] = $scope.bars[1] = $scope.bars[2] = $scope.bars[3] = false; 
		if(q > 0) $scope.bars[0] = true; 
		if(q > 0.25) $scope.bars[1] = true; 
		if(q > 0.50) $scope.bars[2] = true; 
		if(q > 0.75) $scope.bars[3] = true; 
	}); 
	$scope.barStyle = function(idx, active){
		var height = 5 + ((idx) * 5); 
		var top = 20 - height; 
		return {
			"position": "absolute", 
			"width": "6px", 
			"height": ""+height+"px", 
			"background-color": (active)?"#5CB85C":"#d5d5d5",
			"top": ""+top+"px", 
			"left": ""+(idx * 8)+"px"
		}; 
	}
}); 
