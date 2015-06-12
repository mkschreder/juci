JUCI.app
.controller("OverviewPageCtrl", function($scope, $rpc, $uci, $config, gettext, $tr){
	// get normal widgets
	["overview", "overviewStatus"].map(function(widget_area){
		var queue = JUCI.app._invokeQueue.filter(function(x){ 
			return x[1] == "directive" && x[2][0].indexOf(widget_area+"Widget") == 0;
		}); 
		$scope[widget_area+"Widgets"] = queue.map(function(item){
			var directive = item[2][0]; 
			return "<"+directive.toDash()+"/>"; 
		}).sort(); 
	}); 
}); 

JUCI.page("overview", "pages/overview.html"); 
