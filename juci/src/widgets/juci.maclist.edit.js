//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("juciMaclistEdit", function($compile){
	return {
		templateUrl: "/widgets/juci.maclist.edit.html", 
		scope: {
			macList: "=ngModel"
		}, 
		controller: "juciMaclistEdit", 
		replace: true
	 };  
})
.controller("juciMaclistEdit", function($scope, $config, $uci, $rpc, $window, $localStorage, $state, gettext){ 
	$scope.validateMAC = function(mac){ return (new UCI.validators.MACAddressValidator()).validate({ value: mac }); }
	$scope.onAddMAC = function(){
		$scope.macList.push({mac: ""}); 
	}
	
	$scope.onDeleteMAC = function(mac){
		$scope.macList.find(function(x, i){
			if(x.mac == mac) {
				$scope.macList.splice(i, 1); 
				return true; 
			} 
			return false; 
		});  
	}
	
	$scope.onSelectExistingMAC = function(value){
		if(!$scope.macList.find(function(x){ return x.mac == value}))
			$scope.macList.push({mac: value}); 
		$scope.selectedMAC = ""; 
	}
}); 


			
