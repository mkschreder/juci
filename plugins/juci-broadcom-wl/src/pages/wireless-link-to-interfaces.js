//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
//! Copyright (c) 2015 Martin K. Schröder

// this page is a placeholder for providing link to wireless interfaces page in places like network devices. 
JUCI.app
.controller("wirelessLinkToInterfacesPage", function($scope, $uci, $tr, gettext){
	$scope.wifi_link = "<a href='#!/wireless-interfaces'>"+$tr(gettext("Wireless Interfaces"))+"</a>"; 
}); 
