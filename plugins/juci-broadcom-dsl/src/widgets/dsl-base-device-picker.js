//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.factory("dslBaseDevicePicker", function($modal, $network){
	return {
		show: function(opts){
			var def = $.Deferred(); 
			if(!opts) opts = {}; 
			
			$network.getDevices().done(function(items){
				var modalInstance = $modal.open({
					animation: true,
					templateUrl: 'widgets/dsl-base-device-picker.html',
					controller: 'dslBaseDevicePicker',
					resolve: {
						items: function () {
							return items.filter(function(x) { return ((opts.type)?(x.type == opts.type):true); }).map(function(item){
								return { label: item.name, value: item }; 
							}); 
						}
					}
				});

				modalInstance.result.then(function (data) {
					setTimeout(function(){ // do this because the callback is called during $apply() cycle
						def.resolve(data); 
					}, 0); 
				}, function () {
					
				});
			}); 
			return def.promise(); 
		}
	}; 
})
.controller("dslBaseDevicePicker", function($scope, $modalInstance, $wireless, items, gettext){
	$scope.items = items; 
	$scope.data = {}; 
	$scope.ok = function () {
		if(!$scope.data.selected) {
			alert($tr(gettext("You need to select a device!"))); 
			return; 
		}
		$modalInstance.close($scope.data.selected);
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
})
