$juci.module("wifi")
.directive("uciWirelessScheduleEdit", function($compile){
	var plugin_root = $juci.module("wifi").plugin_root; 
	return {
		templateUrl: plugin_root+"/widgets/uci.wireless.schedule.edit.html", 
		scope: {
			schedule: "=ngModel"
		}, 
		controller: "uciWirelessScheduleEdit", 
		replace: true, 
		require: "^ngModel"
		/*link: function(scope, elm, attrs, ctrl){
			scope.ctrl = ctrl; 
			ctrl.$validators.validate = function (modelValue, viewValue) {
				console.log(JSON.stringify(modelValue) +"-"+viewValue); 
				if (ctrl.$isEmpty(modelValue)) { // consider empty models to be valid
						return true;
				}
				
				return false;
			}
		}*/
	};  
}).controller("uciWirelessScheduleEdit", function($scope, gettext, $uci){
	$scope.data = {}; 
	
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
	
	(function(){
		function update_time(){
			if($scope.schedule){
				$scope.schedule.time.value = ($scope.data.timeFrom||"")+"-"+($scope.data.timeTo||""); 
			}
		}
		
		$scope.$watch("data.timeFrom", update_time, true); 
		$scope.$watch("data.timeTo", update_time, true);
	})(); 
	
	$scope.$watch("schedule", function(value){
		if(value != undefined && value.days && value.time){
			$scope.data.days = value.days.value.map(function(x){ return x; }); 
		} 
	});
	 
	$scope.onChangeDays = function($value){
		console.log("Changing days to: "+JSON.stringify($value) + " "+ $scope.selectedTimeFrame);  
		//$scope.schedule.days.value.splice(0,$scope.schedule.days.value.length); 
		$scope.selectedTimeFrame = $value; 
		$scope.schedule.days.value = dayTranslation[$value]; 
		//Object.assign($scope.schedule.days.value, $scope.selectedTimeFrame); 
	}
}); 
