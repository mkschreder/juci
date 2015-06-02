//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.config(function($stateProvider) {
	$stateProvider.state("status", {
		url: "/status", 
		onEnter: function($state){
			$juci.redirect("status-status"); 
		},
	}); 
}); 
