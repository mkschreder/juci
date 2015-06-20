//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("juciScheduleEdit", function($compile){
	return {
		templateUrl: "/widgets/juci.schedule.edit.html", 
		scope: {
			schedule: "=ngModel"
		}, 
		controller: "juciScheduleEdit", 
		replace: true, 
		require: "^ngModel"
	};  
}).controller("juciScheduleEdit", function($scope, gettext, $uci){
	$scope.data = {}; 
	$scope.time_span = { value: "" }; 
	$scope.days = []; 
	
	var dayTranslation = {
		"everyday": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], 
		"workday": ["mon", "tue", "wed", "thu", "fri"], 
		"weekend": ["sat", "sun"]
	}; 
	
	$scope.allTimeFrames = [
		{ label: gettext("Individual Days"), value: "individual" }, 
		{ label: gettext("Every Day"), value: "everyday" }, 
		{ label: gettext("Every Workday"), value: "workday" }, 
		{ label: gettext("All Weekend"), value: "weekend" }
	]; 
	$scope.allDayNames = [
		{ label: gettext("Monday"), value: "mon" }, 
		{ label: gettext("Tuesday"), value: "tue" }, 
		{ label: gettext("Wednesday"), value: "wed" }, 
		{ label: gettext("Thursday"), value: "thu" }, 
		{ label: gettext("Friday"), value: "fri" }, 
		{ label: gettext("Saturday"), value: "sat" }, 
		{ label: gettext("Sunday"), value: "sun" }
	]; 
	$scope.selectedTimeFrame = $scope.allTimeFrames[0].value; 
	
	$scope.$watch("time_span.end_time", function(value){
		if(!$scope.schedule) return; 
		$scope.schedule.time_end = value; 
	}); 
	$scope.$watch("time_span.start_time", function(value){
		if(!$scope.schedule) return; 
		$scope.schedule.time_start = value; 
	}); 
	$scope.$watch("days", function(){
		if(!$scope.schedule) return; 
		$scope.schedule.days.splice(0, $scope.schedule.days.length); 
		$scope.days.map(function(x){ $scope.schedule.days.push(x); }); 
	}, true); 
	$scope.$watch("schedule", function(value){
		if(!value) return; 
		$scope.time_span.value = (value.time_start||"")+"-"+(value.time_end||""); 
		$scope.days.splice(0, $scope.days.length); 
		value.days.map(function(x){ $scope.days.push(x); }); 
		console.log("Schedule obj changed: "+JSON.stringify(Object.keys(value))); 
	}); 
	
	// when predefined day selection is done 
	$scope.onChangeDays = function($value){
		console.log("Changing days to: "+JSON.stringify($value) + " "+ $scope.selectedTimeFrame);  
		$scope.selectedTimeFrame = $value; 
		$scope.days.splice(0, $scope.schedule.days.length); 
		if(dayTranslation[$value]) 
			dayTranslation[$value].map(function(x){ $scope.days.push(x); });
	}
}); 
