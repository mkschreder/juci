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
.controller("wirelessStatusPage", function($scope, $uci, $wireless, gettext){
	$scope.order = function(pred){
		$scope.predicate = pred; 
		$scope.reverse = ($scope.predicate === pred) ? !$scope.reverse : false;
	}
	$uci.$sync("wireless").done(function(){
		$scope.dfs_enabled = $uci.wireless["@wifi-device"].find(function(x){ return x.dfsc.value != 0; }) != null; 
		$scope.doScan = function(){
			$scope.scanning = 1; 
			async.eachSeries($uci.wireless["@wifi-device"].filter(function(x){ return x.dfsc.value != 0; }), function(dev, next){
				console.log("Scanning on "+dev[".name"]); 
				$wireless.scan({device: dev[".name"]}).done(function(){
					setTimeout(function(){
						console.log("Getting scan results for "+dev[".name"]); 
						$wireless.getScanResults({device: dev[".name"]}).done(function(aps){
							$scope.access_points = aps;
							$scope.scanning = 0; 
							$scope.$apply(); 
						}); 
					}, 4000); 
					next(); 
				}); 
			}); 
		} 
	}); 
}); 
