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
.controller("DDNSPage", function ($scope, $uci, $network) {
	$scope.data = {}; 
	$uci.$sync(["ddns"]).done(function () {
		$scope.ddns_list = $uci.ddns["@service"]; 
		$scope.$apply(); 
	}); 

	$scope.onAddDdnsSection = function(){
		$uci.ddns.$create({
			".type": "service", 
			".name": "new ddns config",
			"enabled": true
		}).done(function(ddns){
			$scope.$apply(); 
		}); 
	} 
	
	$scope.onRemoveDdnsSection = function(ddns){
		if(!ddns) return; 
		ddns.$delete().done(function(){
			$scope.$apply(); 
		});  
	}

	$scope.getItemTitle = function(item){
		return item[".name"]; 
	}
});
