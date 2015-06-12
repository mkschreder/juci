JUCI.app
.controller("OverviewPageCtrl", function($scope, $rpc, $uci, $config, gettext, $tr){
	var queue = JUCI.app._invokeQueue.filter(function(x){ 
		return x[1] == "directive" && x[2][0].indexOf("overviewWidget") == 0;
	}); 
	$scope.widgets = queue.map(function(item){
		var directive = item[2][0]; 
		console.log("Found overview widget: "+directive); 
		return "<"+directive.toDash()+"/>"; 
	}).sort(); 
	$scope.statusBoxItems = [
		{ label: "WiFi", icon: "fa-wifi" }, 
		{ label: "Network", icon: "fa-globe" }, 
		{ label: "Phone", icon: "fa-phone" }, 
		{ label: "WPS", icon: "fa-wifi" }
	]; 
}); 

JUCI.page("overview", "pages/overview.html"); 
