//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

(function($juci){
	function JUCIThemeManager(){
		this.currentTheme = null; 
		this.themes = {}; 
		this.loadTheme = function(theme_id){
			console.log("Loading theme "+theme_id); 
			var deferred = $.Deferred(); 
			var self = this; 
			var themes = this.themes; 
			if(!(theme_id in themes)) {
				var theme_root = "themes/"+theme_id; 
				$.getJSON(theme_root+"/theme.json").done(function(data){
					if(!data) return; 
					
					// create new module
					//$juci.module(theme_id, theme_root, data); 
					
					themes[theme_id] = data; 
					if(data.scripts){
						async.eachSeries(data.scripts, function(script, next){
							console.log("Loading "+theme_root + "/"+script); 
							if(!JUCI_COMPILED){
								require([theme_root + "/"+script], function(module){
									next(); 
								}); 
							} else {
								next(); 
							}
						}, function(){
							deferred.resolve(data); 
						}); 
					} else {
						deferred.resolve(data); 
					}
				}).fail(function(){
					console.log("Could not retreive theme config for theme: "+theme_id); 
					self.changeTheme("default"); 
				}); 
			} else {
				deferred.resolve(themes[theme_id]); 
			}
			return deferred.promise(); 
		}; 
		this.changeTheme = function(theme_id){
			var deferred = $.Deferred(); 
			this.loadTheme(theme_id).done(function(theme){
				$juci.config.theme = theme_id; 
				localStorage.setItem("theme", theme_id); 
				var theme_root = "themes/"+theme_id; 
				$("head link[data-theme-css]").remove(); 
				if(theme.styles){
					theme.styles.map(function(x){
						console.log("Adding "+theme_root+'/' + x); 
						var style = $('<link href="'+theme_root+'/' + x + '" rel="stylesheet" data-theme-css/>');
						style.appendTo('head'); 
					}); 
				}
				deferred.resolve(); 
			}).fail(function(){
				deferred.reject(); 
				// error
			}); 
			return deferred.promise(); 
		};  
		this.getCurrentTheme = function(){
			return localStorage.getItem("theme"); 
		}, 
		this.getAvailableThemes = function(){
			return this.themes; 
		}
	}; 
	JUCI.theme = new JUCIThemeManager(); 
	JUCI.app.factory('$theme', function($rootScope, $config, $localStorage, $http){
		return JUCI.theme; 
	}); 
})(JUCI); 
