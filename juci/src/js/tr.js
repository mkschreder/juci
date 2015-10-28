//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
 
// service for managing session data
JUCI.app.factory('$tr', function(gettextCatalog) {
	return function(str){
		return gettextCatalog.getString(str); 
	}
});

JUCI.app.factory('$languages', function($config, gettextCatalog, $localStorage) {
	gettextCatalog.currentLanguage = $localStorage.getItem("language") || $config.settings.localization.default_language.value || "en"; 
	return {
		getLanguages: function(){
			var languages = ($config.settings.localization)?($config.settings.localization.languages.value):[]; 
			return languages.filter(function(lang){
				return lang in gettextCatalog.strings; 
			}).map(function(lang){
				return {
					title: "language."+lang, 
					short_code: lang
				}
			}); 
		}, 
		setLanguage: function(short_code){
			gettextCatalog.currentLanguage = short_code; 
			$localStorage.setItem("language", short_code); 
		}
	}
});
