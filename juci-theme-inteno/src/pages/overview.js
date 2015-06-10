JUCI.app
.controller("OverviewPageCtrl", function($scope, $rpc, $uci, $config, gettext, $tr){
	$scope.statusBoxItems = [
		{ label: "WiFi", icon: "fa-wifi" }, 
		{ label: "Network", icon: "fa-globe" }, 
		{ label: "Phone", icon: "fa-phone" }, 
		{ label: "WPS", icon: "fa-wifi" }
	]; 
}); 

JUCI.page("overview", "pages/overview.html"); 
