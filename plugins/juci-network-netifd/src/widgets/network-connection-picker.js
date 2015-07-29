//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.factory("networkConnectionPicker", function($modal, $network){
	return {
		show: function(opts){
			var def = $.Deferred(); 
			var exclude = {}; // allready added nets that will be excluded from the list
			if(!opts) opts = {}; 
			if(opts.exclude && opts.exclude instanceof Array) opts.exclude.map(function(x){ exclude[x[".name"]] = true; }); 
			$network.getNetworks().done(function(nets){
				var modalInstance = $modal.open({
					animation: true,
					templateUrl: 'widgets/network-connection-picker.html',
					controller: 'networkConnectionPickerModal',
					resolve: {
						nets: function () {
							return nets.filter(function(x) { return x[".name"] != "loopback" && !(x[".name"] in exclude); }).map(function(net){
								return { label: net[".name"], value: net[".name"] }; 
							}); 
						}
					}
				});

				modalInstance.result.then(function (data) {
					setTimeout(function(){ // do this because the callback is called during $apply() cycle
						def.resolve(nets.find(function(x){ return x[".name"] == data; })); 
					}, 0); 
				}, function () {
					console.log('Modal dismissed at: ' + new Date());
				});
			}); 
			return def.promise(); 
		}
	}; 
})
.controller("networkConnectionPickerModal", function($scope, $modalInstance, $wireless, nets, gettext){
	$scope.networks = nets; 
	$scope.data = {}; 
  $scope.ok = function () {
		if(!$scope.data.selected) {
			alert(gettext("You need to select a network!")); 
			return; 
		}
		$modalInstance.close($scope.data.selected);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
})
