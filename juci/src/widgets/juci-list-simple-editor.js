//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com> 
JUCI.app
.directive("juciListSimpleEditor", function(){
	return {
		scope: {
			items: "=ngModel", 
			getItemTitle: "&getItemTitle", 
			onCreate: "&onAddItem", 
			onDelete: "&onDeleteItem", 
			hideButtons: "@hideButtons"
		}, 
		controller: "juciListSimpleEditor", 
		templateUrl: "/widgets/juci-list-simple-editor.html", 
		transclude: true
	}; 
})
.controller("juciListSimpleEditor", function($scope){
	$scope.onListAddItem = function(){
		$scope.onCreate();
	}
	$scope.onListRemoveItem = function(i){
		$scope.onDelete({"$item": i});  
	}
});

