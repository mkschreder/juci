//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

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
