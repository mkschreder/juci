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

	$scope.onAddRule = function(item){
		$uci.qos.$create({
			".type": "classify"
		}).done(function(section){
			$scope.$apply(); 
		}); 
	};

	$scope.onDeleteRule = function(item){
		if(!item) return; 
		item.$delete().done(function(){
			$scope.$apply(); 
		}); 
	};
});
