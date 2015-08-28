//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.factory("$netmodePicker", function($modal, $netmode){
	return {
		show: function(opts){
			var def = $.Deferred(); 
			$netmode.list().done(function(modes){
				var modalInstance = $modal.open({
					animation: true,
					templateUrl: 'widgets/netmode.picker.html',
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
