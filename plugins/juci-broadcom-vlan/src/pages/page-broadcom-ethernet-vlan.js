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
.controller("PageBroadcomEthernetVlan", function($scope, $uci, $network, gettext){
	$scope.getItemTitle = function(dev){
		if(!dev) return "Unknown"; 
		return dev.name.value + " (" +dev.ifname.value + ")"; 
	}
	
	$uci.$sync("layer2_interface_vlan").done(function(){
		$scope.vlan_devices = $uci.layer2_interface_vlan["@vlan_interface"]; 
		$scope.$apply(); 
	}); 
	
	
	$scope.onCreateDevice = function(){
		$uci.layer2_interface_vlan.create({
			".type": "vlan_interface",
			"name": gettext("New interface")
		}).done(function(interface){
			$scope.$apply(); 
		});
	}
	
	$scope.onDeleteDevice = function(dev){
		if(!dev) alert(gettext("Please select a device in the list!")); 
		if(confirm(gettext("Are you sure you want to delete this device?"))){
			dev.$delete().done(function(){
				$scope.vlan_devices = $scope.vlan_devices.filter(function(d){
					return d != dev; 
				}); 
				$scope.$apply(); 
			}); 
		}
	}
}); 
