//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app.controller("IntenoBackupSettingsCtrl", function($scope, $uci, $tr, gettext){
	$uci.$sync(["backup"]).done(function(){
		$scope.services = $uci.backup["@service"];
		$scope.backup = $uci.backup; 
		console.log($scope.services);
	});
});
