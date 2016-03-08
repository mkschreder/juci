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

// a few functions for string conversions
String.prototype.toDash = function(){
	return this.replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase();});
};
String.prototype.toCamel = function(){
	return this.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
};

window.$ = $; 

require.config({
    baseUrl: '/',
    urlArgs: 'v=1.0'
});

JUCI.app.config(function ($stateProvider, $locationProvider, $compileProvider, $urlRouterProvider, $controllerProvider, $templateCacheProvider, $provide) {
	console.log("CONF"); 
	$locationProvider.hashPrefix('!');
	$locationProvider.html5Mode(false); 
	
	$juci.controller = $controllerProvider.register; 
	$juci.directive = $compileProvider.directive; 
	$juci.state = $stateProvider.state; 
	$juci.decorator = function(name, func){
		return $provide.decorator(name, func); 
	}
	$juci.$config = angular.module("juci").config; 
	$juci.$stateProvider = $stateProvider; 

	$juci.$urlRouterProvider = $urlRouterProvider; 
	$juci.redirect = function(page){
		window.location.href = "#!/"+page; 
	}
	$urlRouterProvider.otherwise("404"); 
})
.run(function($templateCache){
	var _get = $templateCache.get; 
	var _put = $templateCache.put; 
	$templateCache.get = function(name){
		name = name.replace(/\/\//g, "/").replace(/^\//, ""); 
		//console.log("Get template '"+name+"'"); 
		return _get.call($templateCache, name); 
	}
	$templateCache.put = function(name, value){
		name = name.replace(/\/\//g, "/").replace(/^\//, ""); 
		//console.log("Put template '"+name+"'"); 
		return _put.call($templateCache, name, value); 
	}
})
.run(function($rootScope, $state, gettextCatalog, $tr, gettext, $rpc, $config, $location, $navigation, $templateCache, $languages){
	console.log("juci: angular init"); 
	
	// TODO: maybe use some other way to gather errors than root scope? 
	$rootScope.errors = []; 
	
	// register a global error handler so we can show all errors
	window.onerror = function(err){
		$rootScope.errors.push({ message: err+":\n\n"+(err.stack||"") });
		alert(err);  
	}
	$rootScope.$on("error", function(ev, data){
		$rootScope.errors.push({message: data}); 
		//console.log("ERROR: "+ev.name+": "+JSON.stringify(Object.keys(ev.currentScope))); 
	}); 
	$rootScope.$on("errors", function(ev, errors){
		if(errors && (errors instanceof Array)){
			$rootScope.errors.concat(errors.map(function(x){ return { message: x }; })); 
		} else {
			$rootScope.errors.length = 0; 
		}
	}); 
	$rootScope.$on("errors_begin", function(ev){
		$rootScope.errors.splice(0, $rootScope.errors.length); 
	}); 
	// set current language
	if($config.settings.juci){
		gettextCatalog.setCurrentLanguage($config.settings.juci.default_language.value); 
		gettextCatalog.debug = $config.settings.juci.language_debug.value;
	}

	var path = $location.path().replace(/\//g, ""); 

	// load the right page from the start
	$rpc.$authenticate().done(function(){
		$juci.redirect(path||$config.settings.juci.homepage.value || "overview"); 
	}).fail(function(){
		$juci.redirect("login");
	}); 

	// setup automatic session "pinging" and redirect to login page if the user session can not be accessed
	setInterval(function(){
		$rpc.$authenticate().fail(function(){
			// TODO: this may not be optimal if it becomes annoying 
			$juci.redirect("login");
		});
	}, 10000); 

	$rootScope.juci_loaded = true; 
}) 
// TODO: figure out how to avoid forward declarations of things we intend to override. 
.directive("juciFooter", function(){ return {} })
.directive("juciLayoutNaked", function(){ return {} })
.directive("juciLayoutSingleColumn", function(){ return {} })
.directive("juciLayoutWithSidebar", function(){ return {} })
.directive("juciNav", function(){ return {} })
.directive("juciNavbar", function(){ return {} })
.directive("juciTopBar", function(){ return {} })
.directive('ngOnload', [function(){
	return {
		scope: {
				callBack: '&ngOnload'
		},
		link: function(scope, element, attrs){
				element.on('load', function(){
						return scope.callBack();
				})
		}
}}]); 

// make autofocus directive work as expected
JUCI.app.directive('autofocus', ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    link : function($scope, $element) {
      $timeout(function() {
        $element[0].focus();
      });
    }
  }
}]);

// This ensures that we have control over the initialization order (base system first, then angular). 
angular.element(document).ready(function() {
	JUCI.$init().done(function(){
		angular.bootstrap(document, ["juci"]);
	}).fail(function(){
		//window.location = "/initfail.html"; 
		//alert("JUCI failed to initialize! look in browser console for more details (this should not happen!)"); 
	}); 
});
