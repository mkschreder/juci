/*	
	This file is part of JUCI (https://github.com/mkschreder/juci.git)

	Copyright (c) 2015 Martin K. Schröder <mkschreder.uk@gmail.com>

	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
*/ 
 
JUCI.app
.directive("juciListEditor", function(){
	return {
		scope: {
			items: "=ngItems", 
			showIcon: "=",
			iconStatus: "&",
			editor: "@itemEditor", 
			editable: "@allowEdit", 
			sortable: "@sortable",
			getItemTitle: "&getItemTitle", 
			onCreate: "&onCreate", 
			onDelete: "&onDelete", 
			onUpdate: "&onUpdate", 
			onEditStart: "&onEditStart",
			onItemMoved: "&onItemMoved",
			hideButtons: "@hideButtons"
		}, 
		controller: "juciListEditor", 
		templateUrl: "/widgets/juci-list-editor.html", 
		compile: function(element, attrs){
		   if (!attrs.allowEdit) { attrs.allowEdit = true; }
		   if (attrs.allowEdit == "false") { attrs.allowEdit = false; }
		}
	}; 
})
.controller("juciListEditor", function($scope){
	$scope.dynamicHtml = "<"+$scope.editor+" ng-model='item'/>"; 
	
	$scope.onListAddItem = function(){
		$scope.item = null; 
		$scope.onCreate();
	}
	$scope.onListEditItem = function(i){
		$scope.item = i; 
		$scope.onEditStart({"$item": i}); 
	}
	$scope.onListRemoveItem = function(i){
		$scope.onDelete({"$item": i});  
		$scope.item = null; //$scope.items.find(function(x){ return x == i }); 
	}
	$scope.onMoveUp = function(i){
		var arr = $scope.items; 
		var idx = arr.indexOf(i); 
		// return if either not found or already at the top
		if(idx == -1 || idx == 0) return; 
		arr.splice(idx, 1); 
		arr.splice(idx - 1, 0, i); 
		$scope.onItemMoved({ $item: i, $prev_index: idx, $index: idx - 1}); 
	}

	$scope.onMoveDown = function(i){
		var arr = $scope.items; 
		var idx = arr.indexOf(i); 
		// return if either not found or already at the bottom
		if(idx == -1 || idx == arr.length - 1) return;
		arr.splice(idx, 1); 
		arr.splice(idx + 1, 0, i); 
		$scope.onItemMoved({ $item: i, $prev_index: idx, $index: idx + 1}); 
	}
}); 
