/*	
	This file is part of JUCI (https://github.com/mkschreder/juci.git)

	Copyright (c) 2015 Martin K. Schröder <mkschreder.uk@gmail.com>

	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
*/ 

JUCI.app
.controller("InternetMultiWANPage", function($scope, $uci, $rpc, $network, $tr, gettext){
	$uci.$sync("multiwan").done(function(){
		$scope.multiwan = $uci.multiwan; 
		$scope.allInterfaces = $uci.multiwan["@interface"].map(function(x){
			return { label: x[".name"], value: x[".name"] }; 
		}); 
		$scope.allInterfaces.push({ label: "[Balancer]", value: "balancer" }); 
		$scope.trafic_rules = $uci.multiwan["@mwanfw"];
		$scope.$apply(); 
	}); 
	$scope.onGetItemTitle = function(item){ return item[".name"]; }; 
	$scope.onAddInterface = function(){
		var i = 1; 
		for(i; i < 100; i++){ if(!$uci.multiwan["wan"+i]) break; }
		if(i == 99) return; 
		$uci.multiwan.$create({".type": "interface", ".name": "wan"+i, "failover_to": "balancer"}).done(function(iface){
			$scope.$apply(); 
		}); 
	}
	$scope.onDeleteInterface = function(iface){
		iface.$delete().done(function(){
			$scope.$apply();
		}); 
	}
	$scope.onAddRule = function(){
		$uci.multiwan.create({ ".type": "mwanfw", "wanrule": "fastbalancer" }).done(function(){
			$scope.$apply();
		});
	};
	$scope.onDeleteRule = function(rule){
		rule.$delete().done(function(){
			$scope.$apply();
		});
	};
	$scope.onGetRuleTitle = function(item){
		if(!item) return "Undefined"; 	
		return 	$tr(gettext("Source addr:")) + " " + ((item.src.value == "") ? $tr(gettext("All")) : item.src.value) + " " + 
				$tr(gettext("Destination addr:")) + " " + ((item.dst.value == "") ? $tr(gettext("All")) : item.dst.value);
	};		
}); 
