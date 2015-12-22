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
.controller("wirelessSchedulePage", function($scope, $uci, gettext){
	$scope.statusItems = [
		{ label: gettext("Enabled"), value: true },
		{ label: gettext("Disabled"), value: false }
	]; 
	$scope.timeSpan = { }; 
	
	$uci.$sync(["wireless"]).done(function(){
		console.log("Got status"); 
		$scope.status = $uci.wireless.status; 
		$scope.schedules = $uci.wireless["@wifi-schedule"]; 
		$scope.$apply(); 
	}).fail(function(err){
		console.log("failed to sync config: "+err); 
	}); 
	
	$scope.onAcceptSchedule = function(){
		var item = $scope.schedule.uci_item; 
		var view = $scope.schedule; 
		
		item.time.value = view.time_start + "-" + view.time_end; 
		item.days.value = view.days; 
		$scope.errors = item.$getErrors(); 
		
		if($scope.errors && $scope.errors.length)
			return; 
		
		$scope.schedule = null; 
		if(item[".new"]) { 
			item[".new"] = false; 
		}
	}
	
	$scope.onDismissSchedule = function(schedule){
		if($scope.schedule && $scope.schedule.uci_item ){
			if($scope.schedule.uci_item[".new"]){
				$scope.schedule.uci_item.$delete().done(function(){
					$scope.$apply(); 
				}); 
			} else {
				$scope.schedule.uci_item.$reset(); 
			}
		} 
		$scope.schedule = null; 
	}
	
	$scope.onAddSchedule = function(){
		$uci.wireless.create({".type": "wifi-schedule"}).done(function(item){
			item[".new"] = true; 
			var time = item.time.value.split("-"); 
			$scope.schedule = {
				time_start: time[0], 
				time_end: time[1], 
				days: item.days.value, 
				uci_item: item
			};
			$scope.$apply(); 
			console.log("Added new schedule!"); 
		}).fail(function(err){
			console.log("Failed to create schedule!"); 
		}); ; 
	}
	
	$scope.onEditSchedule = function(item){
		console.log("Editing: "+item[".name"]); 
		var time = item.time.value.split("-"); 
		$scope.schedule = {
			time_start: time[0], 
			time_end: time[1], 
			days: item.days.value, 
			uci_item: item
		};
	}
	$scope.onDeleteSchedule = function(sched){
		sched.$delete().always(function(){
			$scope.$apply(); 
		}); 
	}
}); 
