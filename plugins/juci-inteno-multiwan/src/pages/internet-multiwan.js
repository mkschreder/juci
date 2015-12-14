//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("InternetMultiWANPage", function($scope, $uci, $rpc, $network, $tr, gettext){
	function refresh(){
		$uci.$sync("multiwan").done(function(){
			$scope.multiwan = $uci.multiwan; 
			$scope.allInterfaces = $uci.multiwan["@interface"].map(function(x){
				return { label: x[".name"], value: x[".name"] }; 
			}); 
			$scope.allInterfaces.push({ label: "[Balancer]", value: "balancer" }); 
			$scope.trafic_rules = $uci.multiwan["@mwanfw"];
			$scope.$apply(); 
		}); 
	}
	refresh(); 
	$scope.onGetItemTitle = function(item){ return item[".name"]; }; 
	$scope.onAddInterface = function(){
		var i = 1; 
		for(i; i < 100; i++){ if(!$uci.multiwan["wan"+i]) break; }
		if(i == 99) return; 
		$uci.multiwan.create({".type": "interface", ".name": "wan"+i}).done(function(iface){
			refresh(); 
		}); 
	}
	$scope.onDeleteInterface = function(item){
		item.$delete().done(function(){
			refresh(); 
		}); 
	}
	$scope.onGetRuleTitle = function(item){
		if(!item) return "Undefined"; 	
		//if(item.name && item.name.value != undefined) return item.name.value;
		return $tr(gettext("Source addr:")) + " " + item.src.value + " " + $tr(gettext("Destination addr:")) + " " + item.dst.value;
	};		
}); 
