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
.controller("simple2GWirelessPage", function($scope, $uci, $config){
	$uci.$sync("wireless").done(function(){
		$scope.radio = $uci.wireless.r2g; 
		$scope.wifi_main = $uci.wireless.i2g; 
		$scope.wifi_guest = $uci.wireless.i2g_guest; 
		$scope.loaded = true; 
		$scope.$apply(); 
	}); 
	$rpc.$on_event("my*", function(name, params){
		alert("event: "+name + " "+ JSON.stringify(params)); 
	}); 
}); 
