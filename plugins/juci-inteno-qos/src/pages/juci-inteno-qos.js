//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app.controller("intenoQosCtrl", function($scope, $uci, $tr, gettext){
	$uci.$sync(["qos"]).done(function(){
		$scope.qos = $uci.qos["@classify"];
		if($uci.qos.Default){
			$scope.targets = $uci.qos.Default.classes.value.split(" ").map(function(x){
				if(x == "Bulk") return { label: "Low", value: x };
				return {label: x, value: x }; 
			});
		}
		$scope.$apply();
	});
	$scope.sort = function(){
		var tmp = $scope.qos[0];
		$scope.qos[0] = $scope.qos[1];
		$scope.qos[1] = tmp;
		$scope.qos[0].comment.value = "test";
	};
	$scope.onGetItemTitle = function(item){
		 return item.target.value;
	};
	$scope.onAddRule = function(item){
		console.log("Add item");
	};
	$scope.onDeleteRule = function(item){
		console.log("del item");
	};
});
