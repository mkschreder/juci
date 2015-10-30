//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("PageUhttpdSettings", function($scope, $uci, $systemService, gettext){
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
		]
	};
	$scope.getItemTitle = function(item){return item;};
	$scope.addItem = function(){return;};
	$scope.deleteIte = function(item){return;};
	$uci.$sync("uhttpd").done(function(){
		$scope.config = $uci.uhttpd.main; 
		$scope.logopts = $uci.uhttpd.logopts;
		console.log($scope.logopts);
		$scope.$apply(); 
	}); 
	$systemService.find("uhttpd").done(function(service){
		$scope.service = service; 
		$scope.$apply(); 
	}); 	
}); 
