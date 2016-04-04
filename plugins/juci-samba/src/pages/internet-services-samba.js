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
.controller("ServiceSambaPage", function($scope, $tr, gettext, $uci, $samba, gettext, $firewall){
	if(!$uci.samba._exists) {
		$scope.samba_not_installed = true; 
		return; 
	}
	$scope.data = {
		networks: [],
		output: []
	};
	$firewall.getZoneNetworks("lan").done(function(nets){
		$scope.data.networks = nets.map(function(net){
			return { label: String(net[".name"]).toUpperCase(), value: net[".name"] };
		});
		$samba.getConfig().done(function(config){
			$scope.config = config; 
			var saved_nets = $scope.config.interface.value.split(" ").filter(function(sn){
				return $scope.data.networks.find(function(net){return (net.value == sn);}) != null;
			});
			$scope.data.networks.map(function(net){
				net.selected = (saved_nets.find(function(sn){return net.value == sn;}) != null) ? true : false;
			});
			$scope.config.interface.value = saved_nets.join(" ");
			$scope.$apply(); 
		});
	});  
	$scope.$watch("data.output", function onSambaDataOutputChanged(output){
		if(!$scope.data || !$scope.config) return;
		$scope.config.interface.value = output.map(function(net){return net.value;}).join(" ");
	}, false);

	$samba.getShares().done(function(shares){
		$scope.shares = shares; 
		$scope.$apply(); 
	});

	$samba.getUsers().done(function(users){
		$scope.users = users; 
		$scope.$apply(); 
	});

	$scope.getSambaShareTitle = function(share){
		return share.name.value; 
	}

	$scope.onCreateShare = function(){
		$uci.samba.$create({
			".type": "sambashare",
			"name": $tr(gettext("New samba share"))
		}).done(function(){
			$scope.$apply(); 
		}); 
	}

	$scope.onDeleteShare = function($item){
		$item.$delete().done(function(){
			$scope.$apply(); 
		}); 
	}

	$scope.onCreateUser = function(){
		$uci.samba.$create({
			".type": "sambausers",
			"user": "guest"
		}).done(function(){
			$scope.$apply(); 
		}); 
	}

	$scope.onDeleteUser = function($item){
		$item.$delete().done(function(){
			$scope.$apply(); 
		}); 
	}

}); 
