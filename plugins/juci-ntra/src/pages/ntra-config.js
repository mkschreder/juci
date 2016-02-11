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
.controller("NTRAConfig", function($scope, $uci, $tr, gettext){
	$uci.$sync("ntra").done(function(){
		$scope.ntra = null; 
		if($uci.ntra && $uci.ntra["@ntra"][0]) $scope.ntra = $uci.ntra["@ntra"][0]; 
		$scope.$apply(); 
	}).fail(function(){
		$scope.ntra = null; 
		$scope.$apply(); 
	}); 

	$scope.onCreateSection = function(){
		$uci.ntra.$create({
			".type": "ntra",
			".name": "main"
		}).done(function(section){
			$scope.ntra = section; 
			$scope.$apply(); 
		}).fail(function(){
			alert($tr(gettext("Could not create config section! Please make sure that /etc/config/ntra file is present on the system and that you have access rights to modify it!"))); 
		}); 
	}
}); 
