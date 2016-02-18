/*	
	This file is part of JUCI (https://github.com/mkschreder/juci.git)

	Copyright (c) 2015 Martin K. Schröder <mkschreder.uk@gmail.com>

	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
*/ 
 
JUCI.app
.controller("SettingsUpgradeCtrl", function($scope, $uci, $config, $rpc, $tr, gettext, $juciDialog){
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
	$scope.onStartUpgrade = function(){
		$juciDialog.show(null, {
			title: $tr(gettext("Do you want to keep your configuration?")),
			content: $tr(gettext("If you answer yes then your configuration will be saved before the upgrade and restored after the upgrade has completed. If you choose 'no' then all your current configuration will be reset to defaults.")),
			buttons: [
				{ label: $tr(gettext("Yes")), value: "yes", primary: true },
				{ label: $tr(gettext("No")), value: "no" },
				{ label: $tr(gettext("Abort")), value: "abort" }
			],
			on_button: function(btn, inst){
				if(btn.value == "yes"){
					startUpgrade(true);
					inst.close();
				}
				if(btn.value == "no"){
					startUpgrade(false);
					inst.close();
				}
				if(btn.value == "abort"){
					inst.dismiss("abort");
				}
			}
		});
	}
	
	$scope.imageSelected = false;
	$scope.onFileSelected = function(){
		var dom = document.getElementById("imageFileSelector");
		if(dom.files && dom.files.length > 0 ){
			$scope.imageSelected = true;
		}else{
			$scope.imageSelected = false;
		}
		$scope.$apply();
	};

	$scope.onCheckUSB(); 
	$scope.onCheckOnline(); 
	
	function startUpgrade(keep_configs){
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
