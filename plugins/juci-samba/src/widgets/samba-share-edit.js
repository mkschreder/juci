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

JUCI.app.requires.push("ui.bootstrap.typeahead"); 
JUCI.app.requires.push("ngAnimate"); 

JUCI.app
.directive("sambaShareEdit", function($compile){
	return {
		scope: {
			share: "=ngModel"
		}, 
		templateUrl: "/widgets/samba-share-edit.html", 
		controller: "sambaShareEdit", 
		replace: true
	 };  
})
.controller("sambaShareEdit", function($scope, $network, $modal){
	$scope.data = {}; 

	$scope.$watch("share", function(value){
		if(!value) return; 
		$scope.data.guest_ok = (value.guest_ok.value == "yes")?true:false; 
		$scope.data.read_only = (value.read_only.value == "yes")?true:false; 
	}); 
	$scope.$watch("data.guest_ok", function(value){
		if(!$scope.share) return; 
		$scope.share.guest_ok.value = (value)?"yes":"no"; 
	}); 
	$scope.$watch("data.read_only", function(value){
		if(!$scope.share) return; 
		$scope.share.read_only.value = (value)?"yes":"no"; 
	}); 

	$scope.onAutocomplete = function(query){
		var def = $.Deferred(); 
		if($scope.path){
			$rpc.juci.samba.autocomplete({ path: $scope.share.path.value }).done(function(result){
				def.resolve(result.paths); 
			}).fail(function(){
				def.reject(); 
			}); 
		} else {
			def.resolve([]); 
		}
		return def.promise(); 
	}
}); 
