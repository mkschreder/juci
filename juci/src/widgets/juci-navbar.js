//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

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
