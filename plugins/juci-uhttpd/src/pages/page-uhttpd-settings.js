//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("PageUhttpdSettings", function($scope, $uci, $systemService){
	$scope.logopts = {ubus_status: {value: []}};
	$scope.status = {
		items: [
			{label: "status ok",		value: "ok"},
			{label: "invalid command",	value: "invalid_command"},
			{label: "invalid argument",	value: "invalid_argument"},
			{label: "method not found", value: "method_not_found"},
			{label: "object not found", value: "object_not_found"},
			{label: "no data",			value: "no_data"},
			{label: "permission denied",value: "permission_denied"},
			{label: "timeout",			value: "timeout"},
			{label: "not supported",	value: "not_supported"},
			{label: "unknown error", 	value: "unknown_error"},
			{label: "connection failed",value: "connection_failed"}
		],
	};
	$scope.method = {};
	$scope.data = {status:  [],method: []}
	$scope.getStatusItemTitle = function(item){return item.label};
	$scope.getMethodItemTitle = function(item){return item};
	$scope.addStatusItem = function(){
		if(!$scope.status.new)return;
		var ret = false;
		$scope.data.status.map(function(item){
			if(item.value == $scope.status.new){
				alert("Status allredy in list, please select another one");
				ret = true;;
			}
		});
		if(ret)return;
		$scope.data.status.push($scope.status.items.find(function(x){return (x.value == $scope.status.new)}));
	};
	$scope.addMethodItem = function(){
		if($scope.method.new.indexOf('.') === -1){
			alert("The input must be on the form Object.Method");
			return;
		}
		if($scope.logopts.ubus_method.value.find(function(x){return (x == $scope.method.new)})){
			alert("Method allredy in list, pease select another one");
			return
		}
		$scope.logopts.ubus_method.value.push($scope.method.new);
		$scope.logopts.ubus_method.value = $scope.logopts.ubus_method.value.filter(function(x){return true;});
		$scope.method.new = "";
	};
	$scope.deleteStatusItem = function(item){
		$scope.data.status = $scope.data.status.filter(function(x){
			return (x != item);
		});
	};
	$uci.$sync("uhttpd").done(function(){
		$scope.config = $uci.uhttpd.main; 
		$scope.logopts = $uci.uhttpd.logopts;
		$scope.data.status = $scope.logopts.ubus_status.value.map(function(x){
			return $scope.status.items.find(function(y){
				return (y.value == x);
			});
		});
		$scope.$watch("data", function(){
			$scope.logopts.ubus_status.value = $scope.data.status.map(function(x){
				return x.value;
			});
		}, true);
		$scope.$apply(); 
	}); 
	$systemService.find("uhttpd").done(function(service){
		$scope.service = service; 
		$scope.$apply(); 
	});
	$scope.onKeyup = function(x){
		if(x.keyCode == 32){//32 = space
			alert("no spaces allowed");
			$scope.method.new = $scope.method.new.slice(0,-1);
		}
	};
	$scope.deleteMethodItem = function(item){
		$scope.logopts.ubus_method.value = $scope.logopts.ubus_method.value.filter(function(x){
			return (x != item);
		});
	 };
}); 
