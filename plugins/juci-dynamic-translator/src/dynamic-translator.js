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
