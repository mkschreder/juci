JUCI.app
.directive("juciListEditor", function(){
	return {
		scope: {
			items: "=ngItems", 
			editor: "@itemEditor", 
			editable: "@allowEdit", 
			getItemTitle: "&getItemTitle", 
			onCreate: "&onCreate", 
			onDelete: "&onDelete", 
			onUpdate: "&onUpdate"
		}, 
		controller: "juciListEditor", 
		templateUrl: "/widgets/juci.list.editor.html", 
		compile: function(element, attrs){
       if (!attrs.allowEdit) { attrs.allowEdit = true; }
       if (attrs.allowEdit == "false") { attrs.allowEdit = false; }
    }
	}; 
})
.controller("juciListEditor", function($scope){
	$scope.dynamicHtml = "<"+$scope.editor+" ng-model='item'/>"; 
	$scope.onListAddItem = function(){
		$scope.onCreate();
	}
	$scope.onListEditItem = function(i){
		$scope.item = i; 
	}
	$scope.onListRemoveItem = function(i){
		$scope.onDelete({"$item": i});  
		$scope.item = $scope.items.find(function(x){ return x == i }); 
	}
	$scope.onGoBack = function(){
		$scope.item = null; 
	}
}); 
