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
		replace: true
	}; 
})
.controller("NavigationCtrl", function($scope, $location, $navigation, $rootScope, $config, $rpc){
	$scope.tree = $navigation.tree(); 
	$scope.hasChildren = function(menu){
		return menu.children_list > 0; 
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
