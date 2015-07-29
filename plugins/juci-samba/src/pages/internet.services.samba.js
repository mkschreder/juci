//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("ServiceSambaPage", function($scope, $samba, gettext){
	$samba.getConfig().done(function(config){
		$scope.config = config; 
		$samba.getShares().done(function(shares){
			$scope.shares = shares; 
			$scope.$apply(); 
		});
		$scope.$apply(); 
	});  
	$scope.getSambaShareTitle = function(share){
		return share.name.value; 
	}
}); 
