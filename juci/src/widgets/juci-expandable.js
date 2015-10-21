//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("juciExpandable", function(){
	return {
		templateUrl: "/widgets/juci-expandable.html", 
		replace: true, 
		scope: {
			title: "@", 
			status: "="
		}, 
		transclude: true, 
		link: function (scope, element, attrs) {
			
		}
	};  
})
