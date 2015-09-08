//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("networkDeviceEdit", function($compile){
	return {
		scope: {
			ngModel: "=ngModel"
		}, 
		link: function(scope, element, attrs){
			if(scope.ngModel && scope.ngModel.type){
				element.html($compile("<network-device-"+scope.ngModel.type+"-edit ng-model='ngModel'></network-device-"+scope.ngModel.type+"-edit>")(scope));
			} else {
				element.html("<p>Device of unknown type!</p>");
			}
		}, 
		template: "test"
	};
})
.controller("InternetLayer2", function($scope, $uci, $rpc, $network, $config){
	$scope.config = $config; 
	
	$network.getDevices().done(function(devices){
		$network.getAdapters().done(function(adapters){
			$network.getNetworks().done(function(nets){
				$rpc.network.interface.dump().done(function(result){
					var interfaces = result.interface; 
					$scope.adapters = adapters.filter(function(a){
						return a.link_type == "ether" && !a.flags.match("NOARP"); 
					}).map(function(a){
						var d = devices.find(function(x){ return x.id == a.name; }); 
						if(d) a.displayname = d.name; 
						else {
							var e = interfaces.find(function(x){ return x.l3_device == a.name; }); 
							if(e) a.displayname = e.interface; 
						}
						return a; 
					}); 
				
					$scope.networks = nets.filter(function(x){ return x.is_lan.value == true }); 
					$scope.$apply(); 
					//drawCyGraph(); 
				}); 
			}); 
		}); 
	}); 
}); 
