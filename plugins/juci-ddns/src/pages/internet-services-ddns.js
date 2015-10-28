//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.controller("DDNSPage", function ($scope, $uci, $network) {
	$scope.data = {}; 
	$uci.$sync(["ddns"]).done(function () {
		$scope.ddns_list = $uci.ddns["@service"]; 
		$scope.$apply(); 
	}); 

	$scope.onAddDdnsSection = function(){
		$uci.ddns.$create({
			".type": "service", 
			".name": "new ddns config",
			"enabled": true
		}).done(function(ddns){
			$scope.$apply(); 
		}); 
	} 
	
	$scope.onRemoveDdnsSection = function(ddns){
		if(!ddns) return; 
		ddns.$delete().done(function(){
			$scope.$apply(); 
		});  
	}

	$scope.getItemTitle = function(item){
		return item[".name"]; 
	}
});
