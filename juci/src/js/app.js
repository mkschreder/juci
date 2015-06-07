//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

// TODO: make this automatic
if(!window.JUCI_COMPILED) window.JUCI_COMPILED = 1; 
//if(!global.JUCI_PLUGINS) global.JUCI_COMPILED = 0; 

$.jsonRPC.setup({
  endPoint: '/ubus',
  namespace: 'luci'
});

window.$ = $; 

require.config({
    baseUrl: '/',
    urlArgs: 'v=1.0'
});



JUCI.app.config(function ($stateProvider, $locationProvider, $compileProvider, $urlRouterProvider, $controllerProvider, $templateCacheProvider, $provide) {
	console.log("CONF"); 
	//$locationProvider.otherwise({ redirectTo: "/" });
	$locationProvider.hashPrefix('!');
	$locationProvider.html5Mode(false); 
	
	$juci.controller = $controllerProvider.register; 
	$juci.directive = $compileProvider.directive; 
	$juci.state = $stateProvider.state; 
	$juci.decorator = function(name, func){
		return $provide.decorator(name, func); 
	}
	$juci.$config = angular.module("luci").config; 
	$juci.$stateProvider = $stateProvider; 

	$juci.$urlRouterProvider = $urlRouterProvider; 
	$juci.redirect = function(page){
		var DEVMODE = (JUCI_COMPILED)?"":"devgui.html"; 
		window.location.href = DEVMODE+"#!/"+page; 
	}
	/*
	$stateProvider.state("404", {
		url: "/404", 
		views: {
			"content": {
				templateUrl: "/html/404.html"
			}
		},
		onEnter: function(){
			if(!$juci._initialized){
				$juci.redirect("/init/404"); 
			}
		}
	}); 
	// application init state. All initialization is done here. 
	$stateProvider.state("init", {
		url: "/init/:redirect", 
		views: {
			"content": {
				templateUrl: "html/init.html"
			}
		}, 
		onEnter: function($state, $stateParams, $config, $rpc, $navigation, $location, $rootScope, $http){
			if($juci._initialized) {
				$juci.redirect($stateParams.redirect || "overview"); 
				return;
			} else {
				
			}
		},
	}); */
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
.run(function($rootScope, $state, gettextCatalog, $tr, gettext, $rpc, $config, $location, $navigation, $templateCache){
	console.log("RUN"); 
	
	/*if(JUCI_COMPILED && JUCI_TEMPLATES !== undefined){
		Object.keys(JUCI_TEMPLATES).map(function(x){
			$templateCache.put(x, JUCI_TEMPLATES[x]); 
		}); 
	}*/
	
	// TODO: maybe use some other way to gather errors than root scope? 
	$rootScope.errors = []; 
	
	// register a global error handler so we can show all errors
	window.onerror = function(err){
		$rootScope.errors.push({ message: err+":\n\n"+err.stack });
		alert(err);  
	}
	$rootScope.$on("error", function(ev, data){
		$rootScope.errors.push({message: data}); 
		//console.log("ERROR: "+ev.name+": "+JSON.stringify(Object.keys(ev.currentScope))); 
	}); 
	$rootScope.$on("errors", function(ev, errors){
		if(errors && (errors instanceof Array)){
			$rootScope.errors.concat(errors.map(function(x){ return { message: x }; })); 
		}
	}); 
	// set current language
	gettextCatalog.currentLanguage = "en"; 
	gettextCatalog.debug = true;
	
	var path = $location.path().replace(/\//g, "").replace(/\./g, "_");  
	
	// Generate states for all loaded pages
	Object.keys($juci.plugins).map(function(pname){
		var plugin = $juci.plugins[pname]; 
		Object.keys(plugin.pages||{}).map(function(k){
			var page = plugin.pages[k]; 
			if(page.view){
				//scripts.push(plugin_root + "/" + page.view); 
				var url = k.replace(/\./g, "-").replace(/_/g, "-").replace(/\//g, "-"); 
				var name = url.replace(/\//g, "_").replace(/-/g, "_"); 
				//console.log("Registering state "+name+" at "+url); 
				var plugin_root = "/plugins/"+pname; 
				$juci.$stateProvider.state(name, {
					url: "/"+url, 
					views: {
						"content": {
							templateUrl: plugin_root + "/" + page.view + ".html"
						}
					},
					// Perfect! This loads our controllers on demand! :) 
					// Leave this code here because it serves as a valuable example
					// of how this can be done. 
					/*resolve: {
						deps : function ($q, $rootScope) {
							var deferred = $q.defer();
							require([plugin_root + "/" + page.view + ".js"], function (tt) {
								$rootScope.$apply(function () {
										deferred.resolve();
								});
								deferred.resolve()
							});
							return deferred.promise;
						}
					},*/
					onEnter: function($uci, $rootScope){
						$rootScope.errors.splice(0, $rootScope.errors.length); 
						
						// this will touch the session so that it does not expire
						$rpc.$authenticate().done(function(){
							$uci.$revert(); 
						}).fail(function(){
							$juci.redirect("login");
						});
						
						document.title = $tr(k.replace(/\//g, ".")+".title")+" - "+$tr(gettext("application.name")); 
					}, 
					onExit: function($interval){
						JUCI.interval.$clearAll(); 
					}
				}); 
			}
		}); 
	}); 
	if($rpc.$isLoggedIn()){
		$juci.redirect(path||"overview"); 
	} else {
		$juci.redirect("login"); 
	};  
})
// TODO: figure out how to avoid forward declarations of things we intend to override. 
.directive("luciFooter", function(){ return {} })
.directive("luciLayoutNaked", function(){ return {} })
.directive("luciLayoutSingleColumn", function(){ return {} })
.directive("luciLayoutWithSidebar", function(){ return {} })
.directive("luciNav", function(){ return {} })
.directive("luciNavbar", function(){ return {} })
.directive("luciTopBar", function(){ return {} })
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

angular.element(document).ready(function() {
	JUCI.$init().done(function(){
		angular.bootstrap(document, ["luci"]);
	}).fail(function(){
		alert("JUCI failed to initialize! look in browser console for more details (this should not happen!)"); 
	}); 
});

