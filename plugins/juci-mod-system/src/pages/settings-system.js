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
.controller("SettingsSystemGeneral", function($scope, $rpc, $uci, $tr, gettext){
	$scope.timezones = {} ; 
	async.series([
		function(next){
			$uci.$sync("system").done(function(){
				if($uci.system["@system"] && $uci.system["@system"].length)
					$scope.system = $uci.system["@system"][0]; 
				next(); 
			}); 
		}, 
		function(next){
			$rpc.system.board().done(function(values){
				$scope.boardinfo = values; 
			}).always(function(){next();}); 
		}, 
		function(next){
			$rpc.juci.system.time.zonelist().done(function(result){
				if(result && result.zones){
					$scope.timezones = result.zones; 
					$scope.allTimeZones = Object.keys(result.zones).sort().map(function(k){
						return { label: k, value: k }; 
					}); 
				}
				next(); 
			}); 
		}
	], function(){
		$scope.loaded = true; 
		$scope.$apply(); 
	}); 
	
	$scope.$watch("system.zonename.value", function(value){
		if(!value) return; 
		$scope.system.timezone.value = $scope.timezones[value]; 
	}); 
	
	$scope.$watch("system.hostname.value", function(value){
		if(value == undefined) return; 
		if(!value) $scope.system.hostname.value = $scope.boardinfo.model.replace(" ", "_"); 
	}); 

	JUCI.interval.repeat("system.time", 1000, function(done){
		$rpc.juci.system.time.get().done(function(result){
			$scope.localtime = (new Date(result.unix_time * 1000)).toLocaleString(); 
			$scope.$apply(); 
			done(); 
		}); 
	}); 
	
	$scope.setRouterTimeToBrowserTime = function(){
		$rpc.juci.system.time.set({ unix_time: Math.floor((new Date()).getTime() / 1000) }).done(function(){
			
		}); 
	}; 
}); 

