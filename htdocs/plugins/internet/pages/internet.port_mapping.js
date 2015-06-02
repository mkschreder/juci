$juci.app
.controller("InternetPortMappingPageCtrl", function($scope, $uci, ModalService, $rpc){
	function reload(){
		$uci.sync("firewall").done(function(){
			$scope.redirects = $uci.firewall["@redirect"];
			$scope.$apply(); 
		}); 
	} reload(); 
	
	$scope.onAddRule = function(){
		$uci.firewall.create({
			".type": "redirect", 
			"src": "wan", 
			"dest": "lan", 
			"target": "DNAT"
		}).done(function(section){
			$scope.rule = section; 
			$scope.rule[".new"] = true; 
			$scope.rule[".edit"] = true; 
			$scope.showModal = 1;
			$scope.$apply(); 
		}); 
	};
	
	$scope.onEditRule = function(rule){
		$scope.rule = rule; 
		rule[".edit"] = true; 
	};
	
	$scope.onDeleteRule = function(rule){
		rule.$delete().done(function(){
			$uci.save(); 
			$scope.$apply(); 
		}); 
	};
	
	$scope.onAcceptEdit = function(rule){
		$uci.save().done(function(){
			rule[".edit"] = false; 
			$scope.$apply(); 
		}); 
	};
	
	$scope.onCancelEdit = function(rule){
		rule[".edit"] = false; 
		if(rule[".new"]){
			rule.$delete().done(function(){
				$scope.$apply(); 
			}); 
		} else {
			rule.$sync().done(function(){
				$scope.$apply(); 
			}); 
		}
	}
}); 
