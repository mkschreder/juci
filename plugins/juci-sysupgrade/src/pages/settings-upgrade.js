//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("SettingsUpgradeCtrl", function($scope, $uci, $config, $rpc, $tr, gettext){
	$scope.sessionID = $rpc.$sid();
	$scope.uploadFilename = "/tmp/firmware.bin";
	$scope.usbFileName = "()"; 
	$scope.usbUpgradeAvailable = false;  
	
	$scope.current_version = $config.board.release.distribution + " " + $config.board.release.version + " " + $config.board.release.revision; 
	
	$uci.$sync("system").done(function(){
		$scope.system = $uci.system; 
		$scope.$apply(); 
	}); 
	
	$rpc.system.board().done(function(info){
		$scope.board = info; 
		$scope.$apply(); 
	}); 

	function confirmKeep(){
		var deferred = $.Deferred(); 
		
		$scope.onConfirmKeep = function(){
			$scope.showConfirm = 0;
			deferred.resolve(true); 
		}
		$scope.onConfirmWipe = function(){
			$scope.showConfirm = 0;
			deferred.resolve(false); 
		}
		
		$scope.showConfirm = 1;
		setTimeout(function(){ $scope.$apply(); }, 0); 
		 
		return deferred.promise(); 
	}
	
	function upgradeStart(path){
		$scope.showUpgradeStatus = 1; 
		$scope.error = null; 
		$scope.message = gettext("Verifying firmware image")+"...";					
		$scope.progress = 'progress'; 
		setTimeout(function(){ $scope.$apply(); }, 0); 
		
		console.log("Trying to upgrade from "+path); 
	
		$rpc.juci.system.upgrade.test({"path": path}).done(function(result){
			$scope.showUpgradeStatus = 0; 
			$scope.$apply(); 

			if(result && result.error) {
				alert("Image check failed: "+result.stdout); 
				return; 
			}

			confirmKeep().done(function(keep){
				$rpc.juci.system.upgrade.start({"path": path, "keep": ((keep)?1:0)}); // this never completes
				window.location = "/reboot.html";  
			}); 
		}).fail(function(){
			$scope.showUpgradeStatus = 0; 
			$scope.$apply(); 
			alert("Image check failed!"); 
		});

		// no need for such fancy way of checking whether we are rebooting
		/*
		$rpc.juci.system.upgrade.start({"path": path, "keep": ((keep_configs)?1:0)}).done(function(result){
			// this will actually never succeed because server will be killed
			console.error("upgrade_start returned success, which means that it actually probably failed but did not return an error"); 
			$scope.error = (result.stdout||"") + (result.stderr||""); 
			$scope.$apply(); 
		}).fail(function(response){
			window.location.
			// clear all juci intervals 
			JUCI.interval.$clearAll(); 
						
			$scope.message = gettext("Upgrade process has started. The web gui will not be available until the upgrade process has completed!");
			$scope.$apply(); 
			
			setTimeout(function(){
				JUCI.interval.repeat("upgrade", 1000, function(done){
					$rpc.session.access().done(function(){
						// it will not succeed anymore because box is rebooting
					}).fail(function(result){
						if(result.code && result.code == -32002) { // access denied error. We will get it when it boots up again. 
							window.location.reload(); 
						}
					}).always(function(){
						done(); 
					}); 
				}); 
			}, 20000); // give it some 20 seconds to actually shut down
		});
		*/
	}
	
	$scope.onCheckOnline = function(){
		$scope.onlineUpgradeAvailable = false;
		$scope.onlineCheckInProgress = 1; 
		$rpc.juci.system.upgrade.check({type: "online"}).done(function(response){
			if(response.online) {
				$scope.onlineUpgrade = response.online; 
				$scope.onlineUpgradeAvailable = true;
			} else {
				$scope.onlineUpgrade = $tr(gettext("No upgrade has been found!")); 
			}
			if(response.stderr) $scope.$emit("error", $tr(gettext("Online upgrade check failed"))+": "+response.stderr); 
			$scope.onlineCheckInProgress = 0; 
			$scope.$apply(); 
		}); 
	} 
	$scope.onUpgradeOnline = function(){
		confirmKeep().done(function(keep){
			upgradeStart($scope.onlineUpgrade, keep); 
		}); 
	}
	
	$scope.onCheckUSB = function(){
		$scope.usbUpgradeAvailable = false;
		$scope.usbCheckInProgress = 1; 
		$rpc.juci.system.upgrade.check({type: "usb"}).done(function(response){
			if(response.usb) {
				$scope.usbUpgrade = response.usb; 
				$scope.usbUpgradeAvailable = true;
			} else {
				$scope.usbUpgrade = $tr(gettext("No upgrade has been found!")); 
			}
			if(response.stderr) $scope.$emit("error", $tr(gettext("USB upgrade check failed"))+": "+response.stderr); 
			$scope.usbCheckInProgress = 0; 
			$scope.$apply(); 
		});
	}
	$scope.onUpgradeUSB = function(){
		confirmKeep().done(function(keep){
			upgradeStart($scope.usbUpgrade, keep); 
		}); 
	}
	
	$scope.onCheckUSB(); 
	$scope.onCheckOnline(); 
	
	$scope.onUploadComplete = function(result){
		console.log("Upload completed: "+JSON.stringify(result)); 
	}
	$scope.onUploadUpgrade = function(keep_configs){
		$scope.showUpgradeStatus = 1; 
		$scope.message = "Uploading..."; 
		$scope.progress = 'uploading'; 
		$("#postiframe").bind("load", function(){
			var json = $(this).contents().text(); 
			var obj = {}; 
			try {
				obj = JSON.parse(json); 
				upgradeStart($scope.uploadFilename); 
			} catch(e){
				$scope.error = $tr(gettext("The server returned an error"))+" ("+JSON.stringify(json)+")";
				$scope.message = $tr(gettext("Upload completed!"))
				$scope.$apply();
				//return;   
			}
			
			$(this).unbind("load"); 
		}); 
		$("form[name='uploadForm']").submit();
	}
	$scope.onDismissModal = function(){
		$scope.showUpgradeStatus = 0; 
	}
}); 
