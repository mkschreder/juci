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
.directive("juciThemePicker", function(){
	return {
		templateUrl: "/widgets/theme-picker.html", 
		replace: true
	 };  
})
.controller("JuciThemePickerController", function($scope, $theme, $config){
	$scope.themes = $config.themes.map(function(x){
		var item = {
			value: x, 
			label: x
		}; 
		if(x == $theme.getCurrentTheme()) $scope.selectedTheme = item; 
		return item; 
	}); 
	if(!$scope.selectedTheme) $scope.selectedTheme = $scope.themes[0]; 
	$scope.onChangeTheme = function(){
		//alert($scope.selectedTheme.id); 
		$theme.changeTheme($scope.selectedTheme.value).done(function(){
			window.location.reload(); 
		});
	}
}); 
