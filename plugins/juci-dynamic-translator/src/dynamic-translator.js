//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app.factory("dynamicTranslator", function($rootScope){
	var strings = []; 
	$rootScope.$on("$locationChangeSuccess", function(){
		console.log("removing string cache of "+strings.length+" strings."); 
		// reset strings on page
		page_strings = []; 	
	}); 

	return {
		push: function(opts){
			strings.push(opts); 
		},
		apply: function(){
			strings.map(function(obj){
				var tmp = {}; 
				tmp[obj.msgid] = obj.msgstr; 
				gettextCatalog.setStrings(obj.language, tmp); 
			}); 
		}
	}; 
}); 

JUCI.app.run(function($rootScope, gettextCatalog, dynamicTranslator) {
	var getString = gettextCatalog.getString; 
	gettextCatalog.getString = function(a, b, c){
		var ret = getString.call(this, a, b, c); 
		dynamicTranslator.push({
			language: gettextCatalog.currentLanguage, 
			msgid: a, 
			msgstr: ret
		}); 
		return ret; 
	}
});
