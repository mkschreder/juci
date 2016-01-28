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
.directive("overviewWidget40USB", function(){
	return {
		templateUrl: "widgets/overview.usb.html", 
		controller: "overviewWidget40USB", 
		replace: true
	 };  
})
.directive("overviewStatusWidget40USB", function(){
	return {
		templateUrl: "widgets/overview.usb.small.html", 
		controller: "overviewWidget40USB", 
		replace: true
	 };  
})
.controller("overviewWidget40USB", function($scope, $uci, $usb, $events){
	$events.subscribe("hotplug.usb", function(res){
		if(res.data && res.data.action && (res.data.action == "add" || res.data.action == "remove")){
			update();
		}
	});
	function update(){
		$usb.getDevices().done(function(devices){
			$scope.devices = devices.filter(function(dev){ return dev.product && !dev.product.match(/Platform/) && !dev.product.match(/Host Controller/); }); 
			$scope.loaded = true; 
			$scope.$apply(); 
		}); 
	}update();
}); 
