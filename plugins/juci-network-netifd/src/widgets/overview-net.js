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
.directive("overviewWidget10Network", function(){
	return {
		templateUrl: "widgets/overview-net.html",
		controller: "overviewWidgetNetwork",
		replace: true
	 };
})
.directive("overviewStatusWidget10Network", function(){
	return {
		templateUrl: "widgets/overview-net-small.html",
		controller: "overviewStatusWidgetNetwork",
		replace: true
	};
})
.controller("overviewStatusWidgetNetwork", function($scope, $rpc, $firewall){
	$scope.statusClass = "text-success";
	JUCI.interval.repeat("overview-network", 1000, function(done){
		async.series([function(next){
			// TODO: move this to factory
			$firewall.getZoneClients("lan").done(function(clients){
				$scope.numClients = clients.filter(function(x){return x.online}).length;
				$scope.done = 1;
			});
		}], function(){
			done();
		});
	});
})
.controller("overviewWidgetNetwork", function($scope, $firewall, $tr, gettext, $juciDialog, $uci){
	$scope.defaultHostName = $tr(gettext("Unknown"));
	$scope.model = {};
	var pauseSync = false;

	JUCI.interval.repeat("overview-netowrk-widget", 2000, function(done){
		if(pauseSync) {
			done();
			return;
		}
		$firewall.getZoneClients("lan").done(function(clients){
			$scope.clients = [];
			console.log(JSON.stringify(clients)); 
			clients.map(function(client){
				client._display_html = "<"+client._display_widget + " ng-model='client'/>";
				$scope.clients.push(client);
			});
			$firewall.getZoneNetworks("lan").done(function(networks){
				if(networks.length < 1) return;
				$scope.model.lan = networks[0];
				$scope.ipaddr = networks[0].ipaddr.value || networks[0].ip6addr.value;
				done();
			});
		});
	});


	$scope.$watch("model.lan", function(){
		if(!$scope.model.lan) return;
		$uci.$sync("dhcp").done(function(){
			$scope.model.dhcp = $uci.dhcp["@dhcp"].find(function(x){
				return x.interface.value == $scope.model.lan[".name"] || x[".name"] == $scope.model.lan[".name"];
			});
			$scope.model.dhcpEnabled = $scope.model.dhcp && !$scope.model.dhcp.ignore.value || false;
		});
	}, false);

	$scope.$watch("model.dhcpEnabled", function(){
		if(!$scope.model.dhcp){
			if($scope.model.lan && $scope.model.dhcpEnabled != undefined){
				$uci.dhcp.$create({
					".type":"dhcp",
					".name": $scope.model.lan[".name"],
					"interface": $scope.model.lan[".name"],
					"ignore": $scope.model.dhcpEnabled
				}).done(function(dhcp){
					$scope.model.dhcp = dhcp;
					$scope.$apply();
				});
			}
		}else {
			$scope.model.dhcp.ignore.value = !$scope.model.dhcpEnabled;
		}
	});

	$scope.onEditLan = function(){
		if(!$scope.model.lan || $scope.model.dhcpEnabled == undefined) return;
		pauseSync = true;
		$juciDialog.show("simple-lan-settings-edit", {
			title: $tr(gettext("Edit LAN Settings")),
			on_button: function(btn, inst){
				if(btn.value == "cancel") {
					pauseSync = false;
					inst.dismiss("cancel"); 
				}
				if(btn.value == "apply") { 
					$uci.$save();
					pauseSync = false;
					inst.close();
				}
			},
			model: $scope.model
		});
	};
});
