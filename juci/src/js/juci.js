//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
//var JUCI = {}, $juci = JUCI; 

(function(scope){
	var $uci = scope.UCI; 
	var $rpc = scope.UBUS; 
	
	function JUCIMain(){
		this.plugins = {}; 
		this.templates = {}; 
		this.pages = {}; 
	}
	
	JUCIMain.prototype.module = function(name, root, data){
		console.error("WARNING: JUCI.module() is deprecated! ["+name+"]"); 
		var self = this; 
		if(data){
			data.plugin_root = root; 
			self.plugins[name] = data; 
		}
		var plugin = self.plugins[name]; 
		var juci = self; 
		return {
			plugin_root: "", //((plugin||{}).plugin_root||"plugins/"+name+"/"), 
			directive: function(name, fn){
				return angular.module("juci").directive(name, fn);
			}, 
			controller: function(name, fn){
				return angular.module("juci").controller(name, fn); 
			}, 
			state: function(name, obj){
				if(obj.templateUrl && plugin.plugin_root) obj.templateUrl = plugin.plugin_root + "/" + obj.templateUrl; 
				if(obj.views) Object.keys(obj.views).map(function(k){
					var v = obj.views[k]; 
					if(v.templateUrl && plugin.plugin_root) v.templateUrl = plugin.plugin_root + "/" + v.templateUrl; 
				}); 
				$juci.$stateProvider.state(name, obj); 
				return this; 
			}
		}
	}; 
	
	JUCIMain.prototype.page = function(name, template, redirect){
		//console.log("Registering page "+name+": "+template); 
		var page = {
			template: template, 
			url: name
		}; 
		if(redirect) page.redirect = redirect; 
		this.pages[name] = page; 
	}
	
	JUCIMain.prototype.template = function(name, code){
		var self = this; 
		self.templates[name] = code; 
	}
	
	JUCIMain.prototype.$init = function(){
		var scripts = []; 
		var deferred = $.Deferred(); 
		var $rpc = scope.UBUS; 
		async.series([
			function(next){
				scope.UBUS.$init().done(function(){
					if(!scope.UBUS.juci || !scope.UBUS.juci.system || !scope.UBUS.juci.system.info){
						// TODO: make this prettier. 
						//alert("Can not establish ubus connection to router. If the router is rebooting then please wait a few minutes and try again."); 
						//return; 
					} 
					next();
				}).fail(function(){
					console.warning("UBUS failed to initialize: this means that no rpc calls will be available. You may get errors if other parts of the application assume a valid RPC connection!"); 
					next(); 
				}); 
			},  
			function(next){
				$uci.$init().fail(function(){
					console.error("UCI failed to initialize!"); 
				}).always(function(){ next(); }); 
			}, 
			function(next){
				$juci.config.$init().fail(function(){
					console.error("CONFIG failed to initialize!"); 
				}).always(function(){ next(); }); 
			}, 
			function(next){
				$rpc.$authenticate().done(function(){
					// here we get router info part of the config. It will allow us to 
					// pick the correct theme in the init script. TODO: perhaps do this somewhere else? 
					$rpc.juci.system.info().done(function(info){
						//console.log("Router info: "+JSON.stringify(info.system)); 
						if(info && info.system) JUCI.config.system = info.system; 
						next(); 
					}).fail(function(){
						console.error("Could not get system info. This gui depends on questd. You likely do not have it installed on your system!"); 
						next(); 
					});
				}).fail(function(){
					console.log("Failed to verify session."); 
					next(); 
				}); 
			},
			// Themes are no longer loaded like this - instead they are compiled in right now and only one can be used at a time. 
			// TODO: make theme changing work again just like before. 
			/*function(next){	
				// TODO: this will be moved somewhere else. What we want to do is 
				// pick both a theme and plugins based on the router model. 
				//console.log("Detected hardware model: "+$juci.config.system.hardware); 
				var $config = $juci.config; 
				
				$config.mode = localStorage.getItem("mode") || "basic"; 
				$config.theme = localStorage.getItem("theme") || "inteno"; 
				
				if($config.theme == "default") $config.theme = "inteno"; 

				$juci.theme.changeTheme($config.theme).done(function(){
				
				}).always(function(){
					next(); 
				}); 
			}, */
			// no longer used! 
			/*function(next){
				require(scripts, function(module){
					next(); 
				}); 
			},*/ 
			function(next){
				// get the menu navigation
				if(!$rpc.juci){
					console.log("skipping menu init");  
					next(); 
					return; 
				}

				console.log("juci: loading menu from server.."); 
				$rpc.juci.ui.menu().done(function(data){
					//console.log(JSON.stringify(data)); 
					// get menu keys and sort them so that parent elements will come before their children
					// this will automatically happen using normal sort because parent element paths are always shorter than their childrens. 
					//var keys = Object.keys(data.menu).sort(function (a, b) { 
					//	return a.localeCompare(b) ; 
					//}); 
					var keys = Object.keys(data.menu); 
					
					keys.map(function(key){
						var menu = data.menu[key]; 
						var view = menu.view; 
						var redirect = menu.redirect; 
						var path = key; 
						//console.log("MENU: "+path); 
						var obj = {
							path: path, 
							href: menu.page || path.replace(/\//g, "-").replace(/_/g, "-"), 
							modes: menu.modes || [ ], 
							text: menu.title 
						}; 
						$juci.navigation.register(obj); 
						if(redirect) redirect = redirect.replace(/\//g, "-").replace(/_/g, "-"); 
						// NOTE: all juci page templates currently have form word<dot>word<dot>..html
						// And their names correspond to the structure of the menu we get from the box.
						// - This makes it easy to find the right page file and simplifies managing a lot of pages.
						// - This also allows plugins to override existing pages simply by supplying their own versions of the page templates
						// - Conclusion: this is one of the things that should almost never be rewritten without providing 
						//   a fallback mechanism for supporting the old (this) way because all plugins depend on this.  
						// JUCI.page(obj.href, "pages/"+obj.path.replace(/\//g, ".")+".html", redirect); 
						JUCI.page(obj.href, "pages/"+obj.href+".html", redirect); 
					}); 
					//console.log("NAV: "+JSON.stringify($navigation.tree())); 
					//$rootScope.$apply(); 
					next(); 
				}).fail(function(){
					next();
				}); 
			}, 
			function(next){
				// set various gui settings such as mode (and maybe theme) here
				$juci.config.mode = localStorage.getItem("mode") || "basic"; 
				next(); 
			}
		], function(){
			deferred.resolve(); 
		}); 
		return deferred.promise(); 
	}
	
	scope.JUCI = scope.$juci = new JUCIMain(); 
	if(typeof angular !== "undefined"){
		// TODO: this list should eventually be split out into plugins.
		// we should in fact use JUCI.app.depends.push("...") for this then
		// otherwise this list of things that are always included in juci will become quite big..
		var app = scope.JUCI.app = angular.module("juci", [
			"ui.bootstrap",
			"ui.router", 
			'ui.select',
			"ui.bootstrap.carousel", 
			'angularModalService', 
			"uiSwitch",
			"ngAnimate", 
			"gettext", 
			"dndLists", 
			"cgPrompt", 
			"checklist-model",
			"ngTagsInput"
		]); 
		app.config(function($stateProvider){
			Object.keys(scope.JUCI.pages).map(function(name){
				var page = scope.JUCI.pages[name];
				var state = {
					url: "/"+page.url,
					views: {
						"content": {
							templateUrl: (page.redirect)?"pages/default.html":page.template
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
					// this function will run upon load of every page in the gui
					onEnter: function($uci, $rootScope, $tr, gettext){
						if(page.redirect) {
							//alert("page redirect to "+page.redirect); 
							$juci.redirect(page.redirect); 
							return; 
						}
						
						$rootScope.errors.splice(0, $rootScope.errors.length); 
						
						// this will touch the session so that it does not expire
						$rpc.$authenticate().done(function(){
							$uci.$rollback(); 
						}).fail(function(){
							$juci.redirect("login");
						});
						
						document.title = $tr(name.replace(/\//g, ".").replace(/-/g, ".")+".title")+" - "+$tr(gettext("application.name")); 
					}, 
					onExit: function($interval){
						// clear all juci intervals when leaving a page
						JUCI.interval.$clearAll(); 
					}
				};  
				
				$stateProvider.state(name, state);
			}); 
		}); 
		
		// override default handler and throw the error out of angular to 
		// the global error handler
		app.factory('$exceptionHandler', function() {
			return function(exception) {
				throw exception; 
				//throw exception+": \n\n"+exception.stack;
			};
		});

		app.run(function($templateCache, $rootScope){
			var self = scope.JUCI; 
			Object.keys(self.templates).map(function(k){
				//console.log("Registering template "+k); 
				$templateCache.put(k, self.templates[k]); 
			}); 
			
		}); 

		app.factory('$rpc', function(){
			return scope.UBUS; 
		});

		app.factory('$uci', function(){
			return scope.UCI; 
		});

		app.factory('$localStorage', function() {
			return scope.localStorage; 
		});
	}
})(typeof exports === 'undefined'? this : exports); 
