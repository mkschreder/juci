//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

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
