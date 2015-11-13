//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive('modal', function ($parse) {
	return {
		templateUrl: "/widgets/core-modal.html", 
		restrict: 'E',
		transclude: true,
		replace:true,
		scope: {
			acceptLabel: "@",
			dismissLabel: "@",
			ngShow: "=",
			onAccept: "&", 
			onDismiss: "&", 
			noFooter: "@",
			title: "@",
			hideCloseBtn : "@"
		}, 
		controller: "ModalController", 
		link: function (scope, element, attrs) {
			scope.element = element;
			scope.$watch("ngShow", function(value){
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
