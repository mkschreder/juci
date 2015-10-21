JUCI.app
.directive("juciContentbox", function(){
	return {
		templateUrl: "/widgets/juci-contentbox.html", 
		replace: true, 
		scope: {
			title: "@title", 
			icon: "@icon",
			show: "@show"
		}, 
		transclude: true 
		//link: function (scope, element, attrs) {
			
		//}
	};
})
