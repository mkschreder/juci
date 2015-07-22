JUCI.app
.directive("juciListEditor", function(){
	return {
		scope: {
			items: "=ngItems", 
			editor: "@editControl", 
			onCreate: "&onCreate", 
			onDelete: "&onDelete", 
			onUpdate: "&onUpdate"
		}, 
		controller: "juciListEditor", 
		templateUrl: "/widgets/juci.list.editor.html"
	}; 
})
.controller("juciListEditor", function($scope){
	$scope.dynamicHtml = "<"+$scope.editor+" ng-model='item'/>"; 
	$scope.onListEditItem = function(i){
		$scope.item = i; 
	}
	$scope.onListDeleteItem = function(i){
		$scope.onDelete(i);  
	}
	$scope.onGoBack = function(){
		$scope.item = null; 
	}
}); 
