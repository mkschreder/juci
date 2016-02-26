/*	
	This file is part of JUCI (https://github.com/mkschreder/juci.git)

	Copyright (c) 2015 Reidar Cederqvist <reidar.cederqvist@gmail.com>

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
.directive("dhcpLeasesWidget", function(){
	return {
		scope: true,
		templateUrl: "/widgets/dhcp-leases-widget.html",
		controller:	"dhcpLeasesWidget"
	}
})
.controller("dhcpLeasesWidget", function($rpc, $uci, $scope){
	JUCI.interval.repeat("ipv4leases", 1000, function(done){
		$rpc.juci.dhcp.ipv4leases().done(function(data){
			$scope.ipv4leases = data.leases;
			$scope.$apply();
		}).always(function(){
			done();
		});
	});
	JUCI.interval.repeat("ipv6leases", 1000, function(done){
		$rpc.juci.dhcp.ipv6leases().done(function(data){
			$scope.ipv6leases = data.leases.filter(function(x){ return x.leasetime; });
			$scope.$apply();
		}).always(function(){
			done();
		});
	});
	function pad(a){
		if(a < 10) return "0"+a;
		return ""+a;
	};
	$scope.to_time_remaining = function(time){
		if(!time) time = (new Date()).getTime(); // prevent NaN!
		var date_now = new Date();
		var time_now = date_now.getTime();
		var time_left = (time - (time_now /1000))
		var days = Math.floor(time_left / 86400)
		time_left = time_left - days * 86400;
		var h = Math.floor(time_left / 3600);
		time_left = time_left - h * 3600;
		var m = Math.floor(time_left / 60);
		var s = Math.round(time_left - m * 60);
		if( days > 0){
			return (pad(days) + " " + pad(h) + ":" + pad(m) + ":" + pad(s)); 
		}
		return (pad(h) + ":" + pad(m) + ":" + pad(s));
	};
});
