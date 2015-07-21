//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("StatsOverviewCtrl", function ($scope, $uci, $rpc, gettext, $config) {
	//$scope.expanded = false; 
	$scope.sections = [{}, {}, {}, {}]; 
	
	JUCI.interval.repeat("status.refresh", 2000, function(resume){
		async.series([
			function(next){
				$uci.sync("boardpanel").done(function(){ next(); }); 
			}, 
			function(next){
				$rpc.network.interface.dump().done(function(result){
					_interfaces = result.interface; 
					next(); 
				}); 
			}, 
			function(next){
				var sections = []; 
				[
					{ name: gettext("Internet"), value: $config.wan_interface }, 
					{ name: gettext("Internet IPv6"), value: $config.ipv6_interface },
					{ name: gettext("Voice"), value: $config.voice_interface }, 
					{ name: gettext("IPTV"), value: $config.iptv_interface }
				].forEach(function(x, c){ 
					var iface = _interfaces.find(function(i){ return i.interface === x.value; }); 
					if(x.value && iface) {
						sections.push({
							"name": x.name, 
							"interface": iface
						});  
					}
				}); 
				sections = sections.filter(function(x){ return x.interface !== undefined; }).sort(function(a, b) { return a.interface.up > b.interface.up; }); 
				for(var c = 0; c < sections.length; c++){
					var sec = sections[c]; 
					if(sec.interface.up) sec.status = "ok"; 
					else if(sec.interface.pending) sec.status = "progress"; 
					else sec.status = "error"; 
					Object.assign($scope.sections[c], sec);
				} 
				$scope.$apply(); 
				next(); 
			}, 
			function(next){
				$rpc.router.dslstats().done(function(result){
					switch(result.dslstats.status){
						case 'Idle': $scope.dsl_status = 'disabled'; break; 
						case 'Showtime': $scope.dsl_status = 'ok'; break; 
						default: $scope.dsl_status = 'progress'; break; 
					}
					$scope.dslinfo = result.dslstats; 
					$scope.$apply(); 
					next(); 
				}); 
			}
		], function(){
			resume(); 
		}); 
	}); 
}); 
