//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
 
JUCI.app
.controller("DropbearSettings", function($scope, $uci){ 
	$uci.$sync("dropbear").done(function(){
		if($uci.dropbear && $uci.dropbear["@dropbear"].length){
			$scope.dropbear = $uci.dropbear["@dropbear"][0]; 
			$scope.$apply(); 
		}
	}); 
	$scope.onSave = function(){
		$uci.save(); 
	} 
}); 
