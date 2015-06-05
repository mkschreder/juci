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
		//$uci.save().done(function(){
		var schedule = $scope.schedule; 
		var errors = schedule.$getErrors(); 
		
		if(errors && errors.length){
			$scope.errors = errors; 
		} else {
			$scope.errors = []; 
			$scope.showScheduleDialog = 0; 
		}
	}
	
	$scope.onDismissSchedule = function(schedule){
		if($scope.schedule[".new"]){
			$scope.schedule.$delete().done(function(){
				$scope.showScheduleDialog = 0; 
				$scope.$apply(); 
			}); 
		} else {
			$scope.showScheduleDialog = 0; 
		}
	}
	
	$scope.onAddSchedule = function(){
		$uci.wireless.create({".type": "wifi-schedule"}).done(function(item){
			$scope.schedule = item; 
			$scope.schedule[".new"] = true; 
			$scope.showScheduleDialog = 1; 
			$scope.$apply(); 
			console.log("Added new schedule!"); 
		}).fail(function(err){
			console.log("Failed to create schedule!"); 
		}); ; 
	}
	
	$scope.onEditSchedule = function(sched){
		console.log("Editing: "+sched[".name"]); 
		$scope.schedule = sched; 
		$scope.showScheduleDialog = 1; 
	}
	$scope.onDeleteSchedule = function(sched){
		sched.$delete().always(function(){
			$scope.$apply(); 
		}); 
	}
}); 
