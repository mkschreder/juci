//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("SettingsConfigurationCtrl", function($scope, $rpc, gettext){
	$scope.sessionID = $rpc.$sid(); 
	$scope.resetPossible = 0; 
	$rpc.luci2.system.reset_test().done(function(result){
		if(result && result.supported) {
			$scope.resetPossible = 1; 
			$scope.$apply();
		} 
	}); 
	$scope.onReset = function(){
		if(confirm(gettext("This will reset your configuration to factory defaults. Do you want to continue?"))){
			$rpc.luci2.system.reset_start().done(function(result){
				console.log("Performing reset: "+JSON.stringify(result)); 
			}); 
		}
	}
	$scope.onSaveConfig = function(){
		$scope.showModal = 1; 
		
	}
	$scope.onRestoreConfig = function(){
		$scope.showUploadModal = 1; 
	}
	$scope.onCancelRestore = function(){
		$scope.showUploadModal = 0; 
	}
	$scope.restore = {}; 
	/*setInterval(function checkUpload(){
		var iframe = $("#postiframe").load(function(){; 
		var json = iframe.contents().text();
		try {
			if(json.length && JSON.parse(json)) {
				$scope.onUploadComplete(JSON.parse(json)); 
			} 
		} catch(e){}
		iframe.each(function(e){$(e).contents().html("<html>");}); ; 
	}, 500); */
	$scope.onUploadConfig = function(){
		$("#postiframe").bind("load", function(){
			var json = $(this).contents().text(); 
			try {
				var obj = JSON.parse(json); 
				$scope.onUploadComplete(JSON.parse(json));
			} catch(e){}
			$(this).unbind("load"); 
		}); 
		$("form[name='restoreForm']").submit();
	}
	$scope.onUploadComplete = function(result){
		console.log("Uploaded: "+JSON.stringify(result)+": "+$scope.restore.password); 
		$rpc.luci2.system.backup_restore({
			password: $scope.restore.password
		}).done(function(result){
			if(result.code){
				alert(result.stderr); 
			} else {
				$scope.showUploadModal = 0; 
				$scope.$apply(); 
			}
		}).fail(function(err){
			console.error("Filed: "+JSON.stringify(err)); 
		}); 
	}
	$scope.onAcceptModal = function(){
		$("form[name='backupForm']").submit();
		$scope.showModal = 0; 
	}
	$scope.onDismissModal = function(){
		$scope.showModal = 0; 
	}
}); 
