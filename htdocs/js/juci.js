//var JUCI = {}, $juci = JUCI; 

(function(scope){
	var $uci = scope.UCI; 
	var $rpc = scope.UBUS; 
	
	function JUCIMain(){
		this.plugins = {}; 
	}
	
	JUCIMain.prototype.module = function(name, root, data){
		var self = this; 
		if(data){
			data.plugin_root = root; 
			self.plugins[name] = data; 
		}
		var plugin = self.plugins[name]; 
		var juci = self; 
		return {
			plugin_root: ((plugin||{}).plugin_root||"plugins/"+name+"/"), 
			directive: function(name, fn){
				return angular.module("luci").directive(name, fn);
			}, 
			controller: function(name, fn){
				return angular.module("luci").controller(name, fn); 
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
	
	JUCIMain.prototype.$init = function(){
		var scripts = []; 
		var deferred = $.Deferred(); 
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
				if(JUCI_COMPILED && JUCI_PLUGINS) {
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
				}); 
			}, 
			function(next){
				$rpc.$authenticate().done(function(){
					// here we get router info part of the config. It will allow us to 
					// pick the correct theme in the init script. TODO: perhaps do this somewhere else? 
					$rpc.router.info().done(function(info){
						//console.log("Router info: "+JSON.stringify(info.system)); 
						if(info && info.system) $juci.config.system = info.system; 
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
				if($rpc.luci2){
					console.log("Getting menu.."); 
					$rpc.luci2.ui.menu().done(function(data){
						//console.log(JSON.stringify(data)); 
						Object.keys(data.menu).map(function(key){
							var menu = data.menu[key]; 
							var view = menu.view; 
							var path = key; 
							//console.log("MENU: "+path); 
							var obj = {
								path: path, 
								href: path.replace(/\//g, "-").replace(/_/g, "-"), 
								modes: data.menu[key].modes || [ ], 
								text: data.menu[key].title, 
								index: data.menu[key].index || 0, 
							}; 
							$juci.navigation.register(obj); 
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
		var app = scope.JUCI.app = angular.module("luci", [
			"ui.bootstrap",
			"ui.router", 
			'ui.select',
			'angularModalService', 
			"uiSwitch",
			"ngAnimate", 
			"gettext", 
			"checklist-model"
		]); 
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
