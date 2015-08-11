//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("juciNav", function(){
	var plugin_root = $juci.module("core").plugin_root; 
	return {
		// accepted parameters for this tag
		scope: {
		}, 
		templateUrl: plugin_root+"/widgets/juci.nav.html", 
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
		if(!item.modes || !item.modes.length) return true; 
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
