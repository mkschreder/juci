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
.directive("juciNav", function(){
	return {
		// accepted parameters for this tag
		scope: {
		}, 
		templateUrl: "/widgets/juci-nav.html", 
		replace: true, 
		controller: "juciNav"
	}; 
})
.controller("juciNav", function($scope, $uci, $navigation, $state, $location, $state, $rootScope, $config){
	$scope.showSubMenuItems = false;
	
	$scope.hasChildren = function(menu){
		return Object.keys(menu.children) > 0;
	};
	$scope.onLinkClick = function(item){
		var node = $navigation.findNodeByHref($location.path().replace(/\//g, "")); 
		if(node.href != item.href) return; 
		$state.reload(); 
		$uci.$mark_for_reload(); 
	}
	$scope.itemVisible = function(item){
		if(!item.modes || !item.modes.length) return true; 
		else if(item.modes && item.modes.indexOf($config.local.mode) == -1) {
			return false; 
		} 
		else return true; 
	};

	function activate(){
		var node = $navigation.findNodeByHref($location.path().replace(/\//g, "")); 
		if(node) {
			$scope.tree = $navigation.tree(node.path.split("/")[0]); 
			$scope.tree.children_list.map(function(item){
				item._open = node.path.indexOf(item.path) == 0; 
				item._class = (item.href == node.href)?'open':''; 
				item.children_list.map(function(item2){
					item2._class = (item2.href == node.href)?'open':''; 
				}); 
			}); 
		}
	}
	activate();
	
});
