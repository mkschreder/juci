$juci.module("core")
.directive('modal', function ($parse) {
	var plugin_root = $juci.module("core").plugin_root; 
	return {
		templateUrl: plugin_root + "/widgets/core.modal.html", 
		restrict: 'E',
		transclude: true,
		replace:true,
		scope: {
			acceptLabel: "@",
			dismissLabel: "@",
			ngShow: "=",
			onAccept: "&", 
			onDismiss: "&", 
			title: "@",
			hideCloseBtn : "@"
		}, 
		controller: "ModalController", 
		link: function (scope, element, attrs) {
			scope.element = element;
			scope.$watch("ngShow", function(value){
				console.log("core.modal.show: "+value); 
				if(value)
					$(element).modal('show');
				else
					$(element).modal('hide');
			});
		}
	};
})
.controller('ModalController', function($scope) {
	
});
