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

JUCI.app
.directive("networkClientEdit", function($compile, $parse){
	return {
		templateUrl: "/widgets/network-client-edit.html", 
		controller: "networkClientEdit", 
		scope: {
			opts: "=ngModel"
		},
		replace: true, 
		require: "^ngModel"
	 };  
}).controller("networkClientEdit", function($scope, $ethernet, $location){	
	$scope.closeDialog = function(){
		if(!$scope.opts || !$scope.opts.modal) return; 
		$scope.opts.modal.dismiss("cancel"); 
	}
}); 

