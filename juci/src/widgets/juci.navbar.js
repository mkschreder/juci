//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("juciNavbar", function($location, $rootScope){
	var plugin_root = $juci.module("core").plugin_root; 
	function activate(){
		var path = $location.path().replace(/^\/+|\/+$/g, ''); 
		var subtree = path.split("-")[0]; 
		
		setTimeout(function(){
			$("ul.nav li a").parent().removeClass("open"); 
			$("ul.nav li a[href='#!"+subtree+"']").addClass("open"); 
			$("ul.nav li a[href='#!"+subtree+"']").parent().addClass("open"); 
		}, 0); 
	}; activate(); 
	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
		activate(); 
	});
	return {
		restrict: 'E', 
		templateUrl: plugin_root+"/widgets/juci.navbar.html", 
		controller: "NavigationCtrl",
		replace: true
	}; 
})
.controller("NavigationCtrl", function($scope, $location, $navigation, $rootScope, $config, $rpc){
	$scope.tree = $navigation.tree(); 
	$scope.hasChildren = function(menu){
		return menu.children_list > 0; 
	}
	
	$scope.onLogout = function(){
		$rpc.$logout().always(function(){
			window.location.href="/";
		});
	}

	$scope.isActive = function (viewLocation) { 
		return viewLocation === $location.path();
	};
	/*
	$(function(){
		var themes = $config.themes; 
		$config.theme = localStorage.getItem("theme") || "default"; 
		//var bootstrap = $('<link href="'+themes[$config.theme]+'/css/bootstrap.min.css" rel="stylesheet" />');
		var theme = $('<link href="'+themes[$config.theme]+'/css/theme.css" rel="stylesheet" />');
		//bootstrap.appendTo('head');
		theme.appendTo('head'); 
		$('.theme-link').click(function(){
			var themename = $(this).attr('data-theme');
			var themeurl = themes[themename];
			$config.theme = themename;
			localStorage.setItem("theme", themename);
			//bootstrap.attr('href',themeurl+"/css/bootstrap.min.css");
			theme.attr('href',themeurl+"/css/theme.css");
		});
	});*/
}); 
