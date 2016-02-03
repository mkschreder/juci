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
.directive("netifdSwitchVlanEdit", function($compile, $parse){
	return {
		templateUrl: "/widgets/netifd-switch-vlan-edit.html", 
		controller: "netifdSwitchVlanEdit", 
		scope: {
			vlan: "=ngModel"
		},
		replace: true, 
		require: "^ngModel"
	 };  
}).controller("netifdSwitchVlanEdit", function($scope, $ethernet, $uci){	
	$scope.allSwitchPorts = []; 
	$scope.selectedSwitchPorts = []; 
	
	$scope.onSelectionChanged = function(){
		if(!$scope.vlan) return; 
		$scope.vlan.ports.value = $scope.selectedSwitchPorts.filter(function(x){ return x.selected; }).map(function(x){ return x.value; }).join(" ");  
	}

	// will load uci value into local variables
	function loadConfig(){
		var vlan = $scope.vlan; 
		if(!vlan) return; 
		// TODO: do we always need CPU port (5) to be tagged? 
		var list = vlan.ports.value.split(" ").filter(function(x){ return x != "5t"; });  
		$scope.selectedSwitchPorts = list.map(function(x){ 
			return $scope.allSwitchPorts.find(function(y){ return y.value == parseInt(x); }); 
		}).filter(function(x){ if(x) x.selected = true; return x != null; }); 
	}

	// load config
	$uci.$sync("network").done(function(){
		$scope.allSwitchPorts = $uci.network["@switch_port_label"].map(function(x){
			return { label: x.name.value, value: x.id.value }; 
		}); 
		$scope.allBaseDevices = $uci.network["@switch"].map(function(d){
			return { label: d.name.value, value: d.name.value }; 
		}); 
		loadConfig(); 
		$scope.$apply(); 
	}); 

	// when model changes, reload the values
	$scope.$watch("vlan", function(vlan){
		loadConfig(); 
	}); 
}); 
