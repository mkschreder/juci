//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app.controller("intenoQosCtrl", function($scope, $uci, $tr, gettext, intenoQos){
	$uci.$sync(["qos"]).done(function(){
		$scope.qos = $uci.qos["@classify"];
		$scope.$apply();
	});

	intenoQos.getDefaultTargets().done(function(targets){
		$scope.targets = targets.map(function(x){ return { label: x, value: x }; }); 
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

	$scope.onItemMoved = function(){
		$uci.qos.$save_order("classify"); 
	}
});
