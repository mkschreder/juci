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
