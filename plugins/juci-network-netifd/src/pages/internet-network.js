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
.controller("InternetNetworkPage", function($scope, $uci, $rpc, $network, $ethernet, $tr, gettext, networkConnectionCreate){
	$scope.data = {}; 
	
	$ethernet.getAdapters().done(function(devices){
		$scope.devices = devices; 
		
		$network.getNetworks().done(function(nets){
			$scope.networks = nets.filter(function(x){ 
				if(x.defaultroute.value) $scope.data.wan_network = x; 
				return x.ifname.value != "lo" 
			}); 
			$scope.networks = $scope.networks.map(function(net){ 
				net.addedDevices = []; 
				var addedDevices = net.ifname.value.split(" "); 
				//net.$type_editor = "<network-connection-proto-"+net.type.value+"-edit/>";
				net.addableDevices = devices
					.filter(function(dev){ 
						var already_added = addedDevices.find(function(x){ 
							return x == dev.id; 
						}); 
						if(!already_added){
							return true; 
						} else {
							net.addedDevices.push( { label: dev.name, value: dev.id }); 
							return false; 
						}
					})
					.map(function(dev){ 
						return { label: dev.name, value: dev.id }; 
					}); 
				return net; 
			}); 
			$scope.$apply(); 
		}); 
	}); 
	
	$scope.onGetItemTitle = function(i){
		return i[".name"]; 
	}
	
	$scope.onAddConnection = function(){
		networkConnectionCreate.show().done(function(data){
			$uci.network.$create({
				".type": "interface",
				".name": data.name, 
				"type": data.type
			}).done(function(interface){
				$scope.current_connection = interface; 
				$scope.networks.push(interface); 
				$scope.$apply(); 
			}); 
		});
	}
	
	$scope.onDeleteConnection = function(conn){
		if(!conn) alert($tr(gettext("Please select a connection in the list!"))); 
		if(confirm($tr(gettext("Are you sure you want to delete this connection?")))){
			conn.$delete().done(function(){
				$scope.networks = $scope.networks.filter(function(net){
					return net[".name"] != conn[".name"]; 
				}); 
				$scope.current_connection = null; 
				$scope.$apply(); 
			}); 
		}
	}
	
	$scope.onEditConnection = function(conn){
		// set editing widget for the type specific part of the conneciton wizard
		$scope.current_connection = conn; 
		
	}
	
	$scope.onCancelEdit = function(){
		$scope.current_connection = null; 
	}
	
	$scope.onAddDevice = function(net, dev){
		if(!dev) return; 
		var devs = {}; 
		net.ifname.value.split(" ").map(function(name){ devs[name] = name; }); 
		devs[dev] = dev; 
		net.ifname.value = Object.keys(devs).join(" "); 
		net.addedDevices = Object.keys(devs).map(function(x){ return { label: x, value: x }; }); 
	}
	
	$scope.onRemoveDevice = function(net, name){
		console.log("removing device "+name+" from "+net.ifname.value); 
		var items = net.ifname.value.split(" ").filter(function(x){ return x != name; }); 
		net.addedDevices = items.map(function(x){ return {label: x, value: x}; }); 
		net.ifname.value = items.join(" "); 
	}
	
}); 
