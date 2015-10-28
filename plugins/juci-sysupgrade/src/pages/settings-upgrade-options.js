//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("SettingsUpgradeOptions", function($scope, $uci, $rpc, $tr, gettext){
	$scope.allImageExtensions = [
		{ label: $tr(gettext(".w (JFFS Image)")), value: ".w" },
		{ label: $tr(gettext(".y (UBIFS Image)")), value: ".y" }, 
		{ label: $tr(gettext("fs_image (RAW Rootfs Image)")), value: "fs_image" }
	]; 
	
	$uci.$sync("system").done(function(){
		$scope.system = $uci.system; 
		$scope.$apply(); 
	}); 
}); 
