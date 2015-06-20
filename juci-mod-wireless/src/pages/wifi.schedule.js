//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("WifiSchedulePageCtrl", function($scope, $uci, gettext){
	$scope.statusItems = [
		{ label: gettext("Enabled"), value: true },
		{ label: gettext("Disabled"), value: false }
	]; 
	$scope.timeSpan = { }; 
	
	$uci.sync(["wireless"]).done(function(){
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
		if(item[".new"]) { 
			item[".new"] = false; 
		}
		item.time.value = view.time_start + "-" + view.time_end; 
		item.days.value = view.days; 
		$scope.schedule = null; 
	}
	
	$scope.onDismissSchedule = function(schedule){
		if($scope.schedule.uci_item && $scope.schedule.uci_item[".new"]){
			$scope.schedule.uci_item.$delete().done(function(){
				$scope.$apply(); 
			}); 
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
