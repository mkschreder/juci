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
.directive("juciModePicker", function($compile){
	return {
		templateUrl: "/widgets/juci-mode-picker.html", 
		controller: "juciModePicker", 
		replace: true
	 };  
})
.controller("juciModePicker", function($scope, $config, $uci, $rpc, $window, $localStorage, $state, $tr, gettext){
	$scope.selectedModeValue = $localStorage.getItem("mode") || "basic";
	$scope.guiModes = [
		{label: $tr(gettext("Basic Mode")), value: "basic"},
		{label: $tr(gettext("Expert Mode")), value: "expert"},
	];   
	$scope.onChangeMode = function(selected){
		$scope.selectedModeValue = selected; 
		console.log("selected value", selected);
		$localStorage.setItem("mode", selected);
		$config.local.mode = selected;
		$state.reload();
	};
}); 
