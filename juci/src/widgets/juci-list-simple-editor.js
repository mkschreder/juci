//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com> 
JUCI.app
.directive("juciListSimpleEditor", function(){
	return {
		scope: {
			items: "=ngItems", 
			getItemTitle: "&getItemTitle", 
			onCreate: "&onCreate", 
			onDelete: "&onDelete", 
			hideButtons: "@hideButtons"
		}, 
		controller: "juciListSimpleEditor", 
		templateUrl: "/widgets/juci-list-simple-editor.html", 
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

