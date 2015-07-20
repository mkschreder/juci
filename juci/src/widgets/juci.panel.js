//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("juciPanel", function(){
	return {
		templateUrl: "/widgets/juci.panel.html", 
		replace: true, 
		scope: {
			title: "@"
		}, 
		transclude: true, 
		controller: "juciPanel"
	};  
}).controller("juciPanel", function($scope){
	
}); 
