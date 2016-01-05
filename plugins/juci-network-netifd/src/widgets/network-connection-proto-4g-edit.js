//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("networkConnectionProto4gEdit", function($compile){
	return {
		scope: {
			interface: "=ngModel"
		}, 
		templateUrl: "/widgets/network-connection-proto-4g-edit.html", 
		controller: "networkConnectionProto4gEdit", 
		replace: true
	 };  
})
.controller("networkConnectionProto4gEdit", function($scope, $network, $modal, $tr, gettext){
	$scope.device = {};
	$rpc.juci.modems.list4g().done(function(data){
		if(data.info) return;
		$scope.modems = data.modems;
		$scope.allModemDevices = data.modems.map(function(x){ return { label: x.name, value:x.service+":"+x.dev+":"+x.ifname }});
		console.log($scope.allModemDevices);
		$scope.$apply();
	});
	$scope.onModemChange = function(value){
		if(!$scope.interface) return;
		var opts = String(value).split(":");
		if(opts.length < 3) return;
		$scope.interface.service.value = opts[0];
		$scope.interface.comdev.value = "/dev/"+opts[1];
		$scope.interface.ifname.value = opts[2];
		console.log($scope.interface);
	};
})
.directive("networkConnectionProto4gAdvancedEdit", function(){
	return {
		templateUrl: "/widgets/network-connection-proto-4g-advanced-edit.html",
		scope: {
			interface: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
}); 
