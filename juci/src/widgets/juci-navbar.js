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
.directive("juciNavbar", function($location, $rootScope, $navigation){
	function activate(){
		var active_node = $navigation.findNodeByHref($location.path().replace(/\//g, "")); 
		if(!active_node) return; 
		var top_node = $navigation.findNodeByPath(active_node.path.split("/")[0]); 
		if(!top_node) return; 	
		setTimeout(function(){
			$("ul.nav li a").parent().removeClass("open"); 
			$("ul.nav li a[href='#!"+top_node.href+"']").addClass("open"); 
			$("ul.nav li a[href='#!"+top_node.href+"']").parent().addClass("open"); 
		}, 0); 
	}; activate(); 
	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
		activate(); 
	});
	return {
		restrict: 'E', 
		templateUrl: "/widgets/juci-navbar.html", 
		controller: "NavigationCtrl",
		replace: true
	}; 
})
.controller("NavigationCtrl", function($scope, $location, $navigation, $rootScope, $config, $rpc, $events){
	$scope.tree = $navigation.tree(); 
	$scope.log_events = []; 
	
	$scope.homepage = $config.settings.juci.homepage.value; 

	$scope.hasChildren = function(menu){
		return menu.children_list > 0; 
	}
	
	$scope.onLogout = function(){
		$rpc.$logout().always(function(){
			JUCI.redirectHome(); 
			window.location.reload(); 
		});
	}

	$scope.isActive = function (viewLocation) { 
		return viewLocation === $location.path();
	};

	$events.subscribe("logread.msg", function(ev){
		$scope.log_events.push(ev); 
		setTimeout(function(){ $scope.$apply(); }, 0); 
	}); 
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
