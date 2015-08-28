//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("overviewStatusWidget99Netmode", function(){
	return {
		templateUrl: "widgets/overview.netmode.html", 
		controller: "overviewStatusWidgetNetmode", 
		replace: true
	 };  
})
.controller("overviewStatusWidgetNetmode", function($scope, $uci, $rpc, $netmode, $netmodePicker){
	$scope.currentNetmode = "Custom"; 
	$scope.done = 1;  
	
	$netmode.getCurrentMode().done(function(current_mode){
		$scope.currentNetmode = current_mode; 
		$scope.onChangeMode = function(){
			$netmodePicker.show({ selected: current_mode }).done(function(selected){
				if(!selected) return; 
				$netmode.select(selected[".name"]).done(function(){
					console.log("Netmode set to "+selected['.name']); 
					window.location.reload(); 
				}); 
			}); 
		}
		$scope.$apply(); 
	}); 
}); 
