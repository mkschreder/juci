JUCI.app
.controller("InternetPortMappingPageCtrl", function($scope, $uci, $rpc){
	function reload(){
		$uci.sync("firewall").done(function(){
			$scope.redirects = $uci.firewall["@redirect"];
			$scope.$apply(); 
		}); 
	} reload(); 
	
	$scope.onAddRule = function(net){
		$uci.firewall.create({
			".type": "redirect", 
			"src": "wan", 
			"dest": "lan", 
			"target": "DNAT"
		}).done(function(section){
			$scope.rule = section; 
			$scope.rule[".new"] = true; 
			//$scope.rule[".edit"] = true; 
			$scope.$apply(); 
		}); 
	};
	
	$scope.onEditRule = function(rule){
		$scope.rule = rule; 
		//$scope.rule[".edit"] = true; 
		console.log($scope.rule[".name"]); 
		console.log(Object.keys($scope.redirects).map(function(k) { return $scope.redirects[k][".name"]; })); 
	};
	
	$scope.onDeleteRule = function(rule){
		rule.$delete().done(function(){
			$scope.$apply(); 
		}); 
	};
	
	$scope.onAcceptEdit = function(){
		$scope.errors = $scope.rule.$getErrors(); 
		if($scope.errors.length) return; 
		$scope.rule = null;  
	};
	
	$scope.onCancelEdit = function(){
		if($scope.rule[".new"]){
			$scope.rule.$delete().done(function(){
				$scope.rule = null; 
				$scope.$apply(); 
			}); 
		} else {
			$scope.rule = null; 
		}
	}
}); 
