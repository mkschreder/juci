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
.directive("networkConnectionProtoStaticEdit", function($compile, $parse){
	return {
		templateUrl: "/widgets/network-connection-proto-static-edit.html", 
		scope: {
			interface: "=ngModel"
		}, 
		controller: "networkConnectionProtoStaticEdit", 
		replace: true, 
		require: "^ngModel"
	 };  
})
.controller("networkConnectionProtoStaticEdit", function($scope, $uci, $network, $rpc, $log, $tr, gettext){
	$scope.expanded = true; 
	$scope.existingHost = { }; 
	$scope.assign_error = null;
	
	$scope.$watch("interface", function(){
		if(!$scope.interface) return;
		console.log($scope.interface.dns.value);
		$scope.dnslist = $scope.interface.dns.value.map(function(x){ return { text:x }});
	}); 
	$scope.onTagsChange = function(){
		$scope.interface.dns.value = $scope.dnslist.map(function(x){return x.text;});
	};
	$scope.assigns = [
		{ label: "64", value: "64" },
		{ label: $tr(gettext("Disabled")), value: "" }
	];
	$scope.evalDns = function(tag){
		var parts = String(tag.text).split(".");
		if(parts.length != 4) return false;
		for(var i = 0; i < 4; i++){	
			var isnum = /^[0-9]+$/.test(parts[i]);
			if(!isnum) return false;
			var num = parseInt(parts[i]);
			if(num < 0 || num > 255) return false;
		}
		return true;
	};
	$scope.onAssignmentChange = function(){
		if($scope.interface.ip6assign.value != ""){
			$scope.interface.ip6addr.value = "";
			$scope.interface.ip6gw.value = "";
		}else{
			$scope.interface.ip6hint.value = "";
		}
	};
	
	$scope.$watchCollection("bridgedInterfaces", function(value){
		if(!value || !$scope.interface || !(value instanceof Array)) return; 
		$scope.interface.ifname.value = value.join(" "); 
	}); 
	
})
.directive("networkConnectionProtoStaticPhysicalEdit", function(){
	return {
		templateUrl: "/widgets/network-connection-standard-physical.html",
		scope: {
			conn: "=ngModel",
			protos: "="
		},
		replace: true,
		require: "^ngModel"
	};
})
.directive("networkConnectionProtoStaticAdvancedEdit", function(){
	return {
		templateUrl: "/widgets/network-connection-proto-static-advanced-edit.html",
		scope: {
			conn: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
});
