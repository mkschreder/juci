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
.controller("StatusNetworkPage", function ($scope, $rootScope, $rpc, gettext, $tr) {
	$scope.systemConnectionsTbl = {
		rows: [["", ""]]
	}; 
	$scope.systemDHCPLeasesTbl = {
		columns: [gettext("Hostname"), gettext("IPv4-Address"), gettext("MAC-Address"), gettext("Leasetime remaining")], 
		rows: [
			[gettext("No active leases"), '', '', '']
		]
	}; 
	$scope.systemStationsTbl = {
		columns: [gettext("IPv4-Address"), gettext("MAC address"), gettext("Signal"), gettext("Noise"), gettext("RX Rate"), gettext("TX Rate")], 
		rows: []
	};
	var conntrack = {}; 
	var clients = {}; 
	var leases = {}; 
	
	JUCI.interval.repeat("status.system.refresh", 1000, function(resume){
		async.parallel([
			function (cb){$rpc.juci.network.conntrack_count().done(function(res){conntrack = res; cb();}).fail(function(res){cb();});},
			function (cb){$rpc.juci.network.clients().done(function(res){clients = res.clients; cb();}).fail(function(res){cb();});},
			function (cb){$rpc.juci.network.dhcp_leases().done(function(res){leases = res.leases || []; cb();}).fail(function(res){cb();});}
		], function(err, next){
			$scope.systemConnectionsTbl.rows = [
				[$tr(gettext("Active Connections")), '<juci-progress value="'+ conntrack.count +'" total="'+conntrack.limit+'"></juci-progress>']
			]; 
			if(leases.length){
				$scope.systemDHCPLeasesTbl.rows = []; 
				leases.map(function(lease){
					var date = new Date(null);
					date.setSeconds(lease.expires); // specify value for SECONDS here
					var time = date.toISOString().substr(11, 8);
					$scope.systemDHCPLeasesTbl.rows.push(
						[lease.hostname, lease.ipaddr, lease.macaddr, time]
					);  
				}); 
			} else {
				$scope.systemDHCPLeasesTbl.rows = [
					[$tr(gettext("No active leases")), '', '', '']
				]; 
			}
			if(Object.keys(clients).length){
				$scope.systemStationsTbl.rows = []; 
				Object.keys(clients).map(function(id){
					var cl = clients[id]; 
					$scope.systemStationsTbl.rows.push(
						[cl.ipaddr, cl.macaddr, 0, 0, cl.rx_rate || 0, cl.tx_rate || 0]
					); 
				}); 
			} else {
				$scope.systemStationsTbl.rows = [
					[$tr(gettext("No active stations")), '', '', '', '', '']
				]; 
			}
			$scope.$apply(); 
		}, function(){
			resume(); 
		});
	}); 
}); 
