JUCI.app
.controller("InternetParentalControlPage", function($scope, $uci, $rpc){
	function reload(){
		$uci.sync("firewall").done(function(){
			$scope.rules = $uci.firewall["@rule"];
			$scope.$apply(); 
		}); 
	} reload(); 
	
	$scope.urlList = [];
	$scope.macList = []; 
	$scope.connectedHosts = []; 
	
	$rpc.router.clients().done(function(clients){
		$scope.connectedHosts = Object.keys(clients).filter(function(x){
			// use only connected hosts
			return clients[x].connected; 
		}).map(function(k){
			return { label: clients[k].hostname+" ("+clients[k].ipaddr+")", value: clients[k].macaddr }; 
		}); 
		$scope.$apply(); 
	});
	
	$uci.sync("firewall").done(function(){
		$scope.urlblock = $uci.firewall.urlblock; 
		$scope.urlblock.url.value.map(function(x){ $scope.urlList.push({url: x}); }); 
		$scope.urlblock.src_mac.value.map(function(x){ $scope.macList.push({mac: x}); }); 
		
		$scope.accessRules = $uci.firewall["@rule"].filter(function(rule){
			return rule.type.value == "internet_access"; 
		}); 
		
		$scope.onAddURL = function(){
			$scope.urlList.push({url: ""}); 
		}
		$scope.onDeleteURL = function(url){
			$scope.urlList = $scope.urlList.filter(function(x){
				return x.url != url; 
			}); 
		}
		$scope.onAddMAC = function(){
			$scope.macList.push({mac: ""}); 
		}
		$scope.onDeleteMAC = function(mac){
			$scope.macList = $scope.macList.filter(function(x){
				return x.mac != mac; 
			});  
		}
		$scope.$watch("urlList", function(){
			$scope.urlblock.url.value = $scope.urlList.map(function(k){
				return k.url; 
			}); 
		}, true); 
		$scope.$watch("macList", function(){
			$scope.urlblock.src_mac.value = $scope.macList.map(function(k){
				return k.mac; 
			}); 
		}, true); 
		
		$scope.onSelectExistingMAC = function(value){
			$scope.macList.push({mac: value}); 
			$scope.selectedMAC = ""; 
		}
		
		$scope.$apply(); 
	}); 
	/*
	$scope.onAddRule = function(net){
		$uci.firewall.create({
			".type": "rule", 
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
	}*/
}); 
