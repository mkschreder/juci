//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
//! Copyright (c) 2015 Martin K. Schröder

JUCI.app
.directive("sambaUserEdit", function($compile){
	return {
		scope: {
			user: "=ngModel"
		}, 
		templateUrl: "/widgets/samba-user-edit.html", 
		controller: "sambaUserEdit", 
		replace: true
	 };  
})
.controller("sambaUserEdit", function($scope){

}); 
