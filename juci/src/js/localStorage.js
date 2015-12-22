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

(function(scope){
	function supports_html5_storage() {
		try {
			return window && 'localStorage' in window && window['localStorage'] !== null;
		} catch (e) {
			return false;
		}
	}
	var fake_storage = {}; 
	function JUCILocalStorage(){
		this.getItem = function(item){ 
			if(supports_html5_storage()) return window.localStorage.getItem(item); 
			else return fake_storage[item]; 
		}; 
		this.setItem = function(item, value){
			if(supports_html5_storage()) return window.localStorage.setItem(item, value); 
			else fake_storage[item] = value; 
			return fake_storage[item]; 
		}
	}
	scope.localStorage = new JUCILocalStorage(); 
})(typeof exports === 'undefined'? this : global); 

