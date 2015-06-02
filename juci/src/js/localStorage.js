//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

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

