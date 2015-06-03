//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

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
			function (cb){$rpc.luci2.network.conntrack_count().done(function(res){conntrack = res; cb();}).fail(function(res){cb();});},
			function (cb){$rpc.router.clients().done(function(res){clients = res; cb();}).fail(function(res){cb();});},
			function (cb){$rpc.luci2.network.dhcp_leases().done(function(res){leases = res.leases || []; cb();}).fail(function(res){cb();});}
		], function(err, next){
			$scope.systemConnectionsTbl.rows = [
				[$tr(gettext("Active Connections")), '<luci-progress value="'+ conntrack.count +'" total="'+conntrack.limit+'"></luci-progress>']
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
