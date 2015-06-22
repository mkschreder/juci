//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
 
JUCI.app
.controller("PhoneLines", function($scope, $uci){
	$uci.sync("voice_client").done(function(){
		$scope.phone_lines = $uci.voice_client["@brcm_line"]; 
		$scope.phone_numbers = $uci.voice_client["@sip_service_provider"]; 
		$scope.allSipAccounts = $scope.phone_numbers.map(function(x){
			return {
				label: x.displayname.value||x.user.value||x.name.value, 
				value: x[".name"]
			}
		});  
		$scope.$apply(); 
	}); 
}); 
