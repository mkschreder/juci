JUCI.app
.controller("StatusNATPageCtrl", function($scope, $rpc, $tr, gettext){
	$scope.conntrack = { count: 0, limit: 0 }; 
	
	$rpc.router.clients().done(function(table){
		var clients = []; 
		Object.keys(table).map(function(x){
			var cl = table[x]; 
			if(cl.connected) clients.push(cl); 
		}); 
		$scope.clients = clients; 
		$scope.conntrack.count = clients.reduce(function(prev, cur){ return prev + (cur.active_cons||0); }, 0); 
		$scope.$apply(); 
	}); 
	
	$rpc.luci2.network.conntrack_count().done(function(res){
		$scope.conntrack.limit = res.limit; 
		$scope.$apply(); 
	});
	
	$rpc.luci2.network.conntrack_table().done(function(table){
		if(table && table.entries){
			$scope.connections = table.entries.sort(function(a, b){ return (a.src+a.dest) < (b.src+b.dest); }).map(function(x){
				switch(x.protocol){
					case 6: x.protocol = "TCP"; break; 
					case 2: x.protocol = "UNIX"; break; 
					case 17: x.protocol = "UDP"; break; 
				}
				return x; 
			}); 
			$scope.$apply(); 
		}
	}); 
}); 
