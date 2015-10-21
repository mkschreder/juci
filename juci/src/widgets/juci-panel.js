//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("juciPanel", function(){
	return {
		templateUrl: "/widgets/juci-panel.html", 
		replace: true, 
		scope: {
			title: "@", 
			is_expanded: "@isOpen"
		}, 
		compile: function(element, attrs){
			if(!attrs.isExpanded) attrs.isExpanded = true; 
		}, 
		transclude: true, 
		controller: "juciPanel"
	};  
}).controller("juciPanel", function($scope){
	
}); 
