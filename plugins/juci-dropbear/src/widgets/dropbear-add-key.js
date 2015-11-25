//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.factory("dropbearAddKey", function($modal, $network){
	return {
		show: function(opts){
			var def = $.Deferred(); 
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'widgets/dropbear-add-key.html',
				controller: 'dropbearAddKeyModel',
				resolve: {
					
				}
			});

			modalInstance.result.then(function (data) {
				setTimeout(function(){ // do this because the callback is called during $apply() cycle
					def.resolve(data); 
				}, 0); 
			}, function () {
				
			});
			return def.promise(); 
		}
	}; 
})
.controller("dropbearAddKeyModel", function($scope, $modalInstance, gettext){
	$scope.data = {}; 
	$scope.ok = function () {
		if(!$scope.data.key) {
			alert(gettext("You need to insert the public key data!")); 
			return; 
		}
		$modalInstance.close($scope.data);
	};

	$scope.cancel = function () {
    	$modalInstance.dismiss('cancel');
	};
})
