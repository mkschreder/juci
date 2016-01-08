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
.controller("overviewStatusWidgetNetwork", function($scope, $rpc){
	$scope.statusClass = "text-success";
	JUCI.interval.repeat("overview-network", 1000, function(done){
		async.series([function(next){
			// TODO: move this to factory
			$rpc.juci.network.clients().done(function(res){
				$scope.numClients = res.clients.length;
				$scope.done = 1;
			});
		}], function(){
			done();
		});
	});
})
.controller("overviewWidgetNetwork", function($scope, $firewall, $tr, gettext, $juciDialog, $uci){
	$scope.defaultHostName = $tr(gettext("Unknown"));

	JUCI.interval.repeat("overview-netowrk-widget", 2000, function(done){
		$firewall.getZoneClients("lan").done(function(clients){
			$scope.clients = [];
			console.log(JSON.stringify(clients)); 
			clients.map(function(client){
				client._display_html = "<"+client._display_widget + " ng-model='client'/>";
				$scope.clients.push(client);
			});
			$firewall.getZoneNetworks("lan").done(function(networks){
				if(networks.length < 1) return;
				$scope.lan = networks[0];
				$scope.ipaddr = networks[0].ipaddr.value || networks[0].ip6addr.value;
				done();
			});
		});
	});
	$scope.onEditLan = function(){
		console.log("testing");
		if(!$scope.lan) return;
		$juciDialog.show("simple-lan-settings-edit", {
			title: $tr(gettext("Edit LAN Settings")),
			on_apply: function(btn, dlg){
				$uci.$save();
				return true;
			},
			model: $scope.lan
		});
	};
});
