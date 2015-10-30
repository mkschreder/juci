//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com> 
JUCI.app
.directive("juciListSimpleEditor", function(){
	return {
		scope: {
			items: "=ngItems", 
			editor: "@itemEditor", 
			editable: "@allowEdit", 
			getItemTitle: "&getItemTitle", 
			onCreate: "&onCreate", 
			onDelete: "&onDelete", 
			onUpdate: "&onUpdate", 
			hideButtons: "@hideButtons"
		}, 
		controller: "juciListSimpleEditor", 
		templateUrl: "/widgets/juci-list-simple-editor.html", 
		compile: function(element, attrs){
       		if (!attrs.allowEdit) { attrs.allowEdit = true; }
       		if (attrs.allowEdit == "false") { attrs.allowEdit = false; }
    	}
	}; 
})
.controller("juciListSimpleEditor", function($scope){
	$scope.dynamicHtml = "<"+$scope.editor+" ng-model='item'/>"; 
	$scope.onListAddItem = function(){
		$scope.item = null; 
		$scope.onCreate();
	}
	$scope.onListRemoveItem = function(i){
		$scope.onDelete({"$item": i});  
		$scope.item = null; //$scope.items.find(function(x){ return x == i }); 
	}
}); 
