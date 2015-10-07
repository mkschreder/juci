//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.factory("utilsAddTestserverPicker", function($modal, $network){
	return {
		show: function(){
			var def = $.Deferred(); 
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'widgets/utils-add-testserver-picker.html',
				controller: 'utilsAddTestserverPicker'
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
.controller("utilsAddTestserverPicker", function($scope, $modalInstance, $tr, gettext){
	$scope.data = {}; 
	$scope.ok = function () {
		if((!$scope.data.address) || (!$scope.data.port)) {
			alert($tr(gettext("Address and port needed"))); 
			return; 
		}
		$modalInstance.close($scope.data);
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
})
