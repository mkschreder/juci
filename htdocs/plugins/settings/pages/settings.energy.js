//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("SettingsEnergyCtrl", function($scope, $uci){
	$uci.sync(["boardpanel"]).done(function(){
		if($uci.boardpanel)
			$scope.boardpanel = $uci.boardpanel; 
		$scope.$apply();
	}); 
	$scope.onSave = function(){
		$uci.save(); 
	}
}); 
