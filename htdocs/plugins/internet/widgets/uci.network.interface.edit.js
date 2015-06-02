JUCI.app
.directive("uciNetworkInterfaceEdit", function($compile, $parse){
	var plugin_root = $juci.module("internet").plugin_root; 
	return {
		templateUrl: plugin_root+"/widgets/uci.network.interface.edit.html", 
		scope: {
			interface: "=ngModel"
		}, 
		controller: "uciNetworkInterfaceEdit", 
		replace: true, 
		require: "^ngModel"
	 };  
}).controller("uciNetworkInterfaceEdit", function($scope, $uci, $rpc, $log, gettext){
	$scope.expanded = true; 
	$scope.existingHost = { }; 
	
	$scope.$watch("interface", function(interface){
		$rpc.router.clients().done(function(clients){
			$uci.sync("dhcp").done(function(){
				if($uci.dhcp && interface[".name"] in $uci.dhcp){
					//alert($scope.interface[".name"]); 
					$scope.dhcp = $uci.dhcp[interface[".name"]]; 
					$scope.staticDHCP = $uci.dhcp["@host"]; 
					$scope.hosts = Object.keys(clients).map(function(k){
						return {
							label: clients[k].hostname, 
							value: clients[k]
						}; 
					}); 
					$scope.$apply(); 
				}
			}); 
		}); 
	}); 
	$scope.dhcpLeaseTimes = [
		{ label: "1 "+gettext("Hour"), value: "1h" }, 
		{ label: "6 "+gettext("Hours"), value: "6h" }, 
		{ label: "12 "+gettext("Hours"), value: "12h" }, 
		{ label: "24 "+gettext("Hours"), value: "24h" }, 
		{ label: gettext("Forever"), value: "24h" } // TODO: implement this on server side
	];  
	$scope.onAddStaticDHCP = function(){
		$uci.dhcp.create({".type": "host"}).done(function(section){
			console.log("Added static dhcp"); 
			$scope.$apply(); 
		}); 
	}
	$scope.onRemoveStaticDHCP = function(host){
		if(!host) return; 
		host.$delete().done(function(){
			$scope.$apply(); 
		}); 
	}
	$scope.onAddExistingHost = function(){
		var item = $scope.existingHost; 
		$uci.dhcp.create({
			".type": "host", 
			name: item.hostname, 
			mac: item.macaddr, 
			ip: item.ipaddr
		}).done(function(section){
			console.log("Added static dhcp: "+JSON.stringify(item)); 
			$scope.$apply(); 
		}); 
	}
}); 
