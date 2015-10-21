//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("overviewStatusWidget99Netmode", function(){
	return {
		templateUrl: "widgets/overview-netmode-small.html", 
		controller: "overviewWidgetNetmode", 
		replace: true
	 };  
})
.directive("overviewWidget99Netmode", function(){
	return {
		templateUrl: "widgets/overview-netmode.html", 
		controller: "overviewWidgetNetmode", 
		replace: true
	 };  
})
.controller("overviewWidgetNetmode", function($scope, $tr, gettext, $uci, $rpc, $netmode, $netmodePicker){
	$scope.done = 1;  
	
	$netmode.getCurrentMode().done(function(current_mode){
		$scope.currentNetmode = current_mode; 
		$netmode.list().done(function(modes){
			$scope.allNetmodes = modes.map(function(x){
				return { label: $tr(x.desc.value), value: x }; 
			}); 
			$scope.currentNetmode = modes.find(function(x){ return x[".name"] == current_mode[".name"]; }); 
			$scope.$apply(); 
		}); 
	}); 

	$scope.onChangeMode = function(){
		var current_mode = $scope.currentNetmode; 
		if(!current_mode) return; 
		$netmodePicker.show({ selected: current_mode[".name"] }).done(function(selected){
			if(!selected) return; 
			$netmode.select(selected[".name"]).done(function(){
				console.log("Netmode set to "+selected['.name']); 
				window.location = "/reboot.html"; 
			}); 
		}); 
	}

	$scope.onApplyNetmode = function(){
		if(!$scope.currentNetmode) return; 
		$netmode.select($scope.currentNetmode[".name"]).done(function(){
			console.log("Netmode set to "+$scope.currentNetmode['.name']); 
			window.location = "/reboot.html"; 
		}); 
	}

	$scope.onChangeModeConfirm = function(){
		if(confirm($tr(gettext("Changing netmode will reset your configuration completely to match that netmode. Do you want to continue?")))){
			$scope.onApplyNetmode(); 
		}
	}
}); 
