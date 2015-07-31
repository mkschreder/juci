//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.factory("networkConnectionCreate", function($modal, $network){
	return {
		show: function(opts){
			var def = $.Deferred(); 
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'widgets/network-connection-create.html',
				controller: 'networkConnectionCreateModal',
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
.controller("networkConnectionCreateModal", function($scope, $modalInstance, $wireless, gettext){
	$scope.data = {}; 
	$scope.interfaceTypes = [
		{ label: "Standard", value: "" },
		{ label: "AnyWAN", value: "anywan"}, 
		{ label: "Bridge", value: "bridge"}
	]; 
  $scope.ok = function () {
		if(!$scope.data.name) {
			alert(gettext("You need to specify both name and type!")); 
			return; 
		}
		$modalInstance.close($scope.data);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
})
