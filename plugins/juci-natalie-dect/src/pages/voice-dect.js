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
.controller("PhoneDectPage", function($uci, $scope, $rpc, gettext, $tr, $events){
	$uci.$sync("dect").done(function(){
		$scope.dect = $uci.dect.dect;
		$scope.$apply();
	});
	$events.subscribe("ubus.object.add", function(event){
		if(event.data.path.split(".")[2] == "handset"){
			$scope.dismissed = true;
		}
	});
	$scope.dectModes = [
		{ label: $tr(gettext("Auto")),	value: "auto" },
		{ label: $tr(gettext("On")),	value: "on" },
		{ label: $tr(gettext("Off")),	value: "off" }
	];
	var timer;
	$scope.dismissed = true;
	$scope.onCancelDECT = function(){
		$scope.dismissed = true;
		clearTimeout(timer);
	};
	$scope.toHexaDecimal = function(string){
		var ret = "";
		for(var i = 0; i < string.length;i+=2){
			ret += string.substr(i, 2) + " ";
		}
		return ret;
	};
	if($rpc.sys && $rpc.sys.dect){
		JUCI.interval.repeat("dect.refresh", 1000, function(done){
			$rpc.sys.dect.status().done(function(stats){
				$scope.status = stats;
				$scope.$apply();
				done();
			});
		});
		$scope.onStartPairing = function(){
			$scope.dismissed = false;
			$rpc.sys.dect.pair().done(function(){});
			timer = setTimeout(function(){$scope.dismissed = true;}, 1000*180);
		}
		$scope.onPingHandset = function(hs){
			$rpc.sys.dect.ping({ id: hs.id }).done(function(){
			});
		}
	}
});
