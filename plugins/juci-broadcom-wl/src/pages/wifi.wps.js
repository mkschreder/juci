//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("WifiWPSPageCtrl", function($scope, $uci, $rpc, $interval, $router, gettext, $tr){
	var wps_status_strings = {
		"-1": $tr(gettext("wps.status.disabled")),
		0: $tr(gettext("wps.status.init")),
		1: $tr(gettext("wps.status.processing")),
		2: $tr(gettext("wps.status.success")),
		3: $tr(gettext("wps.status.fail")),
		4: $tr(gettext("wps.status.timeout")),
		7: $tr(gettext("wps.status.msgdone")),
		8: $tr(gettext("wps.status.overlap"))
	}; 
	
	$scope.router = $router;
	
	$scope.data = {
		userPIN: ""
	}
	$scope.progress = 0; 
	
	$scope.wpsUnlocked = function(interface){
		return ["wpa", "mixed-wpa"].indexOf(interface.encryption.value) == -1 && interface.closed.value != true; 
	}
	
	$uci.sync(["wireless"]).done(function(){
		$scope.wireless = $uci.wireless; 
		$scope.$apply(); 
	}).fail(function(err){
		console.log("failed to sync config: "+err); 
	}); 
	
	JUCI.interval.repeat("wifi.wps.retry", 1000, function(next){
		$rpc.juci.broadcom.wps.status().done(function(result){
			$scope.progress = result.code; 
			$scope.text_status = wps_status_strings[result.code]||gettext("wps.status.unknown"); 
			$scope.$apply();	
			next();
		}); 
	}); 
	
	$rpc.juci.broadcom.wps.showpin().done(function(data){
		$scope.generatedPIN = data.pin; 
	}); 
	
	$scope.save = function(){
		$uci.save(); 
	}
	$scope.onPairPBC = function(){
		$rpc.juci.broadcom.wps.pbc();
	}
	$scope.onPairUserPIN = function(){
		var pin = $scope.data.userPIN.replace("-", "").replace(" ", ""); 
		$rpc.juci.broadcom.wps.stapin({ pin: pin });
	}
	$scope.onGeneratePIN = function(){
		$rpc.juci.broadcom.wps.genpin().done(function(data){
			$rpc.juci.broadcom.wps.setpin({pin: data.pin}).done(function(){
				$scope.generatedPIN = data.pin; 
				$scope.$apply(); 
			}); 
		}); 
	}
	
	$scope.onCancelWPS = function(){
		$rpc.juci.broadcom.wps.stop(); 
	} 
}); 
