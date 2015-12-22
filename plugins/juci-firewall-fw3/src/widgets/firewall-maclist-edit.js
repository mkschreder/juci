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
.directive("firewallMaclistEdit", function($compile){
	return {
		templateUrl: "/widgets/firewall-maclist-edit.html", 
		scope: {
			macList: "=ngModel"
		}, 
		controller: "firewallMaclistEdit", 
		replace: true
	 };  
})
.controller("firewallMaclistEdit", function($scope, $config, $uci, $rpc, $network, $localStorage, $state, gettext){ 
	$network.getConnectedClients().done(function(clients){
		$scope.connectedHosts = clients.map(function(client){
			return { 
				label: (client.hostname)?(client.hostname +" ("+client.ipaddr+")"):client.ipaddr, 
				value: client.macaddr 
			}; 
		}); 
		$scope.$apply(); 
	});
	
	$scope.validateMAC = function(mac){ 
		return (new UCI.validators.MACAddressValidator()).validate({ value: mac }); 
	}
	$scope.onAddMAC = function(){
		$scope.macList.push({mac: ""}); 
	}
	
	$scope.onDeleteMAC = function(mac){
		$scope.macList.find(function(x, i){
			if(x.mac == mac) {
				$scope.macList.splice(i, 1); 
				return true; 
			} 
			return false; 
		});  
	}
	
	$scope.onSelectExistingMAC = function(value){
		if(!$scope.macList.find(function(x){ return x.mac == value}))
			$scope.macList.push({mac: value}); 
		$scope.selectedMAC = ""; 
	}
}); 


			
