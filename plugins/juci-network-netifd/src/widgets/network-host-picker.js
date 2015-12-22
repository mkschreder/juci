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
.factory("networkHostPicker", function($modal, $network){
	return {
		show: function(opts){
			var def = $.Deferred(); 
			var exclude = {}; // allready added nets that will be excluded from the list
			if(!opts) opts = {}; 
			$network.getConnectedClients().done(function(clients){
				var modalInstance = $modal.open({
					animation: true,
					templateUrl: 'widgets/network-host-picker.html',
					controller: 'networkHostPickerModal',
					resolve: {
						hosts: function () {
							return clients.filter(function(cl){
								// network option is no longer present so we can no longer do this
								// if(opts.net && opts.net != "" && opts.net != "*" && opts.net != cl.network) return false; 
								return true; 
							}).map(function(cl){
								return { label: cl.ipaddr, value: cl }; 
							}); 
						}
					}
				});

				modalInstance.result.then(function (data) {
					setTimeout(function(){ // do this because the callback is called during $apply() cycle
						def.resolve(data); 
					}, 0); 
				}, function () {
					console.log('Modal dismissed at: ' + new Date());
				});
			}); 
			return def.promise(); 
		}
	}; 
})
.controller("networkHostPickerModal", function($scope, $modalInstance, $wireless, hosts, gettext){
	$scope.hosts = hosts; 
	$scope.data = {}; 
  $scope.ok = function () {
		if(!$scope.data.selected) {
			alert(gettext("You need to select a host!")); 
			return; 
		}
		$modalInstance.close($scope.data.selected);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
})
