/*
 * juci - javascript universal client interface
 *
 * Project Author: Martin K. Schröder <mkschreder.uk@gmail.com>
 * 
 * Copyright (C) 2012-2013 Inteno Broadband Technology AB. All rights reserved.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA
 */
 
$juci.module("core")
.directive("luciNav", function(){
	var plugin_root = $juci.module("core").plugin_root; 
	return {
		// accepted parameters for this tag
		scope: {
		}, 
		templateUrl: plugin_root+"/widgets/luci.nav.html", 
		replace: true, 
		controller: "NavCtrl",
		controllerAs: "ctrl"
	}; 
})
.controller("NavCtrl", function($scope, $navigation, $location, $state, $rootScope, $config){
	$scope.showSubMenuItems = false;

	$scope.hasChildren = function(menu){
		return Object.keys(menu.children) > 0;
	};
	$scope.isItemActive = function (item) {
		if ('/' + item.href === $location.path()) {
			if(item.children_list && item.children_list.length > 0) {
				$scope.showSubMenuItems = true;
			} else {
				$scope.showSubMenuItems = false;
			}
				return true;
		} else if ($location.path().indexOf('/' + item.href) === 0) {
			$scope.showSubMenuItems = true;
		} else {
			$scope.showSubMenuItems = false;
		}
		return false;
	};

	$scope.isSubItemActive = function (item) {
		return '/' + item.href === $location.path();
	};

	$scope.itemVisible = function(item){
		if(!item.modes.length) return true; 
		else if(item.modes && item.modes.indexOf($config.mode) == -1) {
			return false; 
		} 
		else return true; 
	};

	function activate(){
		var path = $location.path().replace(/^\/+|\/+$/g, '');
		var subtree = path.split("-")[0];
		$scope.tree = $navigation.tree(subtree);
	}
	activate();
	
});
