JUCI.app
.directive("juciContentbox", function(){
	var plugin_root = $juci.module("core").plugin_root; 
	return {
		templateUrl: plugin_root + "/widgets/juci.contentbox.html", 
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
