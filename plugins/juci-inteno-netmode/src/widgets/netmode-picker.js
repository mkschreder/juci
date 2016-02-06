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
.factory("$netmodePicker", function($modal, $netmode){
	return {
		show: function(opts){
			var def = $.Deferred(); 
			$netmode.list().done(function(modes){
				var modalInstance = $modal.open({
					animation: true,
					templateUrl: 'widgets/netmode-picker.html',
					controller: 'netmodePicker',
					resolve: {
						modes: function () {
							return modes; 
						}, 
						selected: function(){
							return (opts || {}).selected; 
						}
					}
				});

				modalInstance.result.then(function (data) {
					setTimeout(function(){ // do this because the callback is called during $apply() cycle
						def.resolve(modes.find(function(x){ return x[".name"] == data; })); 
					}, 0); 
				}, function () {
					console.log('Modal dismissed at: ' + new Date());
				});
			}); 
			return def.promise(); 
		}
	}; 
})
.controller("netmodePicker", function($scope, $modalInstance, $wireless, modes, selected, gettext){
	$scope.allNetmodes = modes.map(function(x){
		return { label: x.desc.value, value: x };
	});  
	$scope.data = { 
		selected: modes.find(function(x){ return x[".name"] == selected; }) 
	}; 
	$scope.ok = function () {
		if(!$scope.data.selected) {
			alert(gettext("You need to select a netmode!")); 
			return; 
		}
		$modalInstance.close(($scope.data.selected || {})[".name"]);
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
})
