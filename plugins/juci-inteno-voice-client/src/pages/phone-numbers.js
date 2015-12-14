//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
 
JUCI.app
.controller("PagePhoneNumbers", function($scope, $uci){
	$scope.defaultNumber = gettext("N/A"); 
	$uci.$sync("voice_client").done(function(){
		$scope.phone_numbers = $uci.voice_client["@sip_service_provider"]; 
		$scope.phone_lines = $uci.voice_client["@brcm_line"]; 
		$scope.allSipAccounts = $scope.phone_numbers.map(function(x){
			return {
				label: x.name.value, 
				value: x[".name"]
			}
		}); 
		$scope.$apply(); 
	}); 
}); 
