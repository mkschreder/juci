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
.controller("UPNPMainPage", function($scope, $uci, $systemService, $network, $firewall, $upnp, $tr, gettext){
	JUCI.interval.repeat("upnp-status-refresh", 1000, function(done){
		$systemService.find("miniupnpd").done(function(service){
			$scope.service = service;
			$rpc.juci.upnpd.ports().done(function(result){ 
				$scope.upnpOpenPorts = result.ports; 
				$scope.$apply();
				done(); 
			}); 
		}).fail(function(){
			$scope.upnp_not_present = true; 
			$scope.$apply(); 
		});
	}); 
	$scope.networks = [];

	$scope.acls = [];
	$scope.action = [
		{ label: $tr(gettext("Allow")),	value:"allow" },
		{ label: $tr(gettext("Deny")),	value:"deny" }
	];

	$scope.onStartStopService = function(){
		if(!$scope.service) return;
		if($scope.service.running){
			$scope.service.stop().done(function(){
				$scope.$apply();
			});
		} else {
			$scope.service.start().done(function(){
				$scope.$apply();
			});
		}
	}

	$scope.onEnableDisableService = function(){
		if(!$scope.service) return;
		if($scope.service.enabled){
			$scope.service.disable().done(function(){
				$scope.$apply();
			});
		} else {
			$scope.service.enable().done(function(){
				$scope.$apply();
			});
		}
	}

	$upnp.getConfig().done(function(config){
		$scope.upnp = config;
		$scope.acls = $uci.upnpd["@perm_rule"];
		$network.getNetworks().done(function(data){
			$scope.networks = data.map(function(x){
				return {
					label: String(x[".name"]).toUpperCase(),
					value: x[".name"]
				}
			});
			$scope.$apply();
		});
	});

	$scope.onAclMoveUp = function(acl){
		var arr = $uci.upnpd["@perm_rule"]; 
		var idx = arr.indexOf(acl); 
		// return if either not found or already at the top
		if(idx == -1 || idx == 0) return; 
		arr.splice(idx, 1); 
		arr.splice(idx - 1, 0, acl); 
		$uci.upnpd.$save_order("perm_rule"); 
	}

	$scope.onAclMoveDown = function(acl){
		var arr = $uci.upnpd["@perm_rule"]; 
		var idx = arr.indexOf(acl); 
		// return if either not found or already at the bottom
		if(idx == -1 || idx == arr.length - 1) return;
		arr.splice(idx, 1); 
		arr.splice(idx + 1, 0, acl); 
		$uci.upnpd.$save_order("perm_rule"); 
	}

	$scope.onAclAdd = function(){
		$uci.upnpd.$create({
			".type": "perm_rule"
		}).done(function(){
			$scope.$apply(); 
		}); 
	}

	$scope.onAclRemove = function(acl){
		if(!acl) return; 
		acl.$delete().done(function(){
			$scope.$apply(); 
		}); 
	}
});
