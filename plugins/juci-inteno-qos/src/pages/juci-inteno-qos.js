/*	
	This file is part of JUCI (https://github.com/mkschreder/juci.git)

	Copyright (c) 2015 Reidar Cederqvist <reidar.cederqvist@gmail.com>

	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
*/ 

JUCI.app.controller("intenoQosCtrl", function($scope, $uci, $tr, gettext, intenoQos){
	$uci.$sync(["qos"]).done(function(){
		$scope.qos = $uci.qos["@classify"];
		$scope.$apply();
	});

	intenoQos.getDefaultTargets().done(function(targets){
		$scope.targets = targets.map(function(x){ return { label: x, value: x }; }); 
		$scope.$apply(); 
	}); 

	$scope.onAddRule = function(item){
		$uci.qos.$create({
			".type": "classify"
		}).done(function(section){
			$scope.$apply(); 
		}); 
	};

	$scope.onDeleteRule = function(item){
		if(!item) return; 
		item.$delete().done(function(){
			$scope.$apply(); 
		}); 
	};

	$scope.onItemMoved = function(){
		$uci.qos.$save_order("classify"); 
	}
});
