//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.controller("OverviewPageCtrl", function($scope, $rpc, $uci, $config, gettext, $tr){
	function chunk(array, chunkSize) {
		return [].concat.apply([],
			array.map(function(elem,i) {
				return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
			})
		);
	}
	// get normal widgets
	["overview", "overviewStatus", "overviewSlider"].map(function(widget_area){
		var queue = JUCI.app._invokeQueue.filter(function(x){ 
			return x[1] == "directive" && x[2][0].indexOf(widget_area+"Widget") == 0;
		}); 
		$scope[widget_area+"Widgets"] = queue.map(function(item){
			var directive = item[2][0]; 
			return "<"+directive.toDash()+"/>"; 
		}).sort(); 
	}); 
	$scope.overviewWidgetRows = chunk($scope.overviewWidgets, 3); 
}); 

JUCI.page("overview", "pages/overview.html"); 
