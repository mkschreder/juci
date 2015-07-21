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
		console.log("Registering page "+name+": "+template); 
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
					if(!scope.UBUS.router || !scope.UBUS.router.info){
						alert("Questd must have crashed or is not running. Restart it on the router!"); 
					}
				}).fail(function(){
					console.error("UBUS failed to initialize!"); 
				}).always(function(){ next(); }); 
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
				var count = 0; 
				next(); 
				/*if(JUCI_COMPILED && JUCI_PLUGINS) {
					function dirname(path) { var dir = path.split("/"); dir.pop(); return dir.join("/");}
					Object.keys(JUCI_PLUGINS).map(function(plugin){
						var dir = dirname(plugin);
						var name = dir.split("/").pop(); 
						console.log("Registering builtin plugin: "+name+": "+dir+" "+JUCI_PLUGINS[plugin]); 
						JUCI.module(name, dir, JUCI_PLUGINS[plugin]); 
						JUCI.plugins[name] = JUCI_PLUGINS[plugin]; 
					});
					next(); 
					return; 
				}
				async.each($juci.config.plugins, function(id, next){
					count++; 
					console.log(".."+id, 10+((80/$juci.config.plugins.length) * count)); 
					var plugin_root = "plugins/"+id; 
					$.getJSON(plugin_root + "/plugin.json")
					.done(function(data){
						console.log("found plugin "+id); 
						$juci.module(id, plugin_root, data); 
						//$juci.plugins[id] = data; 
						if(data && data.scripts){
							data.scripts.map(function(x){scripts.push(plugin_root + "/" + x); });
						} 
						// load page controllers
						if(data.pages) {
							Object.keys(data.pages).map(function(k){
								var page = data.pages[k]; 
								if(page.view){
									//scripts.push(plugin_root + "/" + page.view); 
									var url = k.replace(/\./g, "-").replace(/_/g, "-").replace(/\//g, "-"); 
									var name = url.replace(/\//g, "_").replace(/-/g, "_"); 
									//console.log("Registering state "+name+" at "+url); 
									scripts.push(plugin_root + "/" + page.view); 
								}
							}); 
						} 
						next(); 
					}).error(function(data){
						next(); 
					}); 
				}, function(){
					next(); 
				}); */
			}, 
			function(next){
				$rpc.$authenticate().done(function(){
					// here we get router info part of the config. It will allow us to 
					// pick the correct theme in the init script. TODO: perhaps do this somewhere else? 
					$rpc.router.info().done(function(info){
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
			function(next){
				
				
				// TODO: this will be moved somewhere else. What we want to do is 
				// pick both a theme and plugins based on the router model. 
				//console.log("Detected hardware model: "+$juci.config.system.hardware); 
				var themes = {
					"CG300A": "inteno-red"
				}; 
				var $config = $juci.config; 
				
				$config.mode = localStorage.getItem("mode") || "basic"; 
				$config.theme = localStorage.getItem("theme") || themes[$config.system.hardware] || "inteno-red"; 
				
				$config.theme = "vodafone";
				
				if(!JUCI_COMPILED){
					$juci.theme.changeTheme($config.theme).done(function(){
						next(); 
					}).fail(function(){
						next(); 
					}); 
				} else {
					next(); 
				}
			}, 
			function(next){
				if(!JUCI_COMPILED){
					require(scripts, function(module){
						next(); 
					}); 
				} else {
					next(); 
				}
			}, 
			function(next){
				// get the menu navigation
				if($rpc.juci){
					console.log("Getting menu.."); 
					$rpc.juci.ui.menu().done(function(data){
						//console.log(JSON.stringify(data)); 
						var keys = Object.keys(data.menu).sort(function (a, b) { 
							return b < a ; 
						}); 
						console.log(keys.join("\n")); 
						
						keys.map(function(key){
							var menu = data.menu[key]; 
							var view = menu.view; 
							var redirect = menu.redirect; 
							var path = key; 
							//console.log("MENU: "+path); 
							var obj = {
								path: path, 
								href: path.replace(/\//g, "-").replace(/_/g, "-"), 
								modes: data.menu[key].modes || [ ], 
								text: data.menu[key].title, 
								index: data.menu[key].index || 0
							}; 
							$juci.navigation.register(obj); 
							if(redirect) redirect = redirect.replace(/\//g, "-").replace(/_/g, "-"); 
							JUCI.page(obj.href, "pages/"+obj.path.replace(/\//g, ".")+".html", redirect); 
						}); 
						//console.log("NAV: "+JSON.stringify($navigation.tree())); 
						//$rootScope.$apply(); 
						next(); 
					}).fail(function(){
						next();
					}); 
				} else {
					console.error("Menu call is not present!"); 
					next(); 
				}
			}
		], function(){
			deferred.resolve(); 
		}); 
		return deferred.promise(); 
	}
	
	scope.JUCI = scope.$juci = new JUCIMain(); 
	if(typeof angular !== "undefined"){
		var app = scope.JUCI.app = angular.module("juci", [
			"ui.bootstrap",
			"ui.router", 
			'ui.select',
			'angularModalService', 
			"uiSwitch",
			"ngAnimate", 
			"gettext", 
			"dndLists", 
			"checklist-model"
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
					onEnter: function($uci, $rootScope, $tr, gettext){
						if(page.redirect) {
							//alert("page redirect to "+page.redirect); 
							$juci.redirect(page.redirect); 
							return; 
						}
						
						$rootScope.errors.splice(0, $rootScope.errors.length); 
						
						// this will touch the session so that it does not expire
						$rpc.$authenticate().done(function(){
							$uci.$revert(); 
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
				throw exception+": \n\n"+exception.stack;
			};
		});
		app.run(function($templateCache, $rootScope){
			var self = scope.JUCI; 
			Object.keys(self.templates).map(function(k){
				console.log("Registering template "+k); 
				$templateCache.put(k, self.templates[k]); 
			}); 
			
		}); 
		app.factory('$rpc', function(){
			return scope.UBUS; 
		});
		app.factory('$uci', function(){
			return scope.UCI; 
		}); 		
		/*app.factory('$session', function() {
			return scope.UBUS.$session; 
		});*/
		app.factory('$localStorage', function() {
			return scope.localStorage; 
		});
	}
})(typeof exports === 'undefined'? this : exports); 
