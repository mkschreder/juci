//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.controller("LoginPageCtrl", function($scope){
	console.log("LOGIN PAGE: "+$juci.module("core").plugin_root);  
}); 

JUCI.page("login", "pages/login.html"); 
