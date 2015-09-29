//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.directive("diagnosticsWidget90Speedtest", function($compile, $parse){
	return {
		templateUrl: "/widgets/diagnostics-widget-speedtest.html",
		controller: "diagnosticsWidget90Speedtest", 
		replace: true
	 };  
}).directive("overviewWidget99Speedtest", function($compile, $parse){
	return {
		templateUrl: "/widgets/diagnostics-widget-speedtest.html",
		controller: "diagnosticsWidget90Speedtest", 
		replace: true
	 };  
})
.controller("diagnosticsWidget90Speedtest", function($scope, $rpc, $events){
	
}); 
