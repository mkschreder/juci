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
	$scope.getIcon = function(iconStatus){
		if(iconStatus == "muted") 	return "fa fa-circle fa-2x text-muted";
		if(iconStatus == "primary") 	return "fa fa-circle fa-2x text-primary";
		if(iconStatus == "success") 	return "fa fa-circle fa-2x text-success";
		if(iconStatus == "info") 	return "fa fa-circle fa-2x text-info";
		if(iconStatus == "warning") 	return "fa fa-circle fa-2x text-warning";
		if(iconStatus == "danger") 	return "fa fa-circle fa-2x text-danger";
		if(iconStatus == "offline") 	return "fa fa-times-circle fa-2x";
		if(iconStatus == "pending") 	return "fa fa-spinner fa-2x fa-spin text-warning";
		if(iconStatus == "online")	return "fa fa-check-circle fa-2x text-success";
		return "";
	};

	$scope.onMoveDown = function(i){
		var arr = $scope.items; 
		var idx = arr.indexOf(i); 
		// return if either not found or already at the bottom
		if(idx == -1 || idx == arr.length - 1) return;
		arr.splice(idx, 1); 
		arr.splice(idx + 1, 0, i); 
		$scope.onItemMoved({ $item: i, $prev_index: idx, $index: idx + 1}); 
	}
	
	$scope.$watch("items", function(){
		if(!$scope.items ) return;
		if($scope.items.length > 0) $scope.item = $scope.items[0]; 
	})
}); 
