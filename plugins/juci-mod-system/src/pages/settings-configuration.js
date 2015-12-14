//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("SettingsConfigurationCtrl", function($scope, $rpc, $tr, gettext){
	$scope.sessionID = $rpc.$sid(); 
	$scope.resetPossible = 0; 
	$scope.resetPossible = 1; 

	$rpc.juci.system.conf.features().done(function(features){
		$scope.features = features; 
	}); 

	$scope.onReset = function(){
		if(confirm(gettext("This will reset your configuration to factory defaults. Do you want to continue?"))){
			$rpc.juci.system.defaultreset().done(function(result){
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
	$scope.data = {}; 
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
		console.log("Uploaded: "+JSON.stringify(result)); 
		$rpc.juci.system.conf.restore({
			pass: $scope.data.pass
		}).done(function(result){
			if(result.error){
				alert(result.error); 
			} else {
				$scope.showUploadModal = 0; 
				$scope.$apply(); 
				if(confirm($tr(gettext("Configuration has been restored. You need to reboot the device for settings to take effect! Do you want to reboot now?")))){
					$rpc.juci.system.reboot(); 
				}
			}
		}).fail(function(err){
			console.error("Filed: "+JSON.stringify(err)); 
		}).always(function(){
			$scope.data = {}; 
			$scope.$apply(); 
		}); 
	}
	$scope.onAcceptModal = function(){
		if($scope.data.pass != $scope.data.pass_repeat) {
			alert($tr(gettext("Passwords do not match!"))); 
			return; 
		}
		if($scope.data.pass == undefined || $scope.data.pass_repeat == undefined){
			if(!confirm($tr(gettext("Are you sure you want to save backup without password?")))) return; 
		}
		$("form[name='backupForm']").submit();
		$scope.data = {}; 
		$scope.showModal = 0; 
	}
	$scope.onDismissModal = function(){
		$scope.showModal = 0; 
	}
}); 
