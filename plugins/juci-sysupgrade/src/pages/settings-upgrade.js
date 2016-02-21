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
.controller("SettingsUpgradeCtrl", function($scope, $uci, $config, $rpc, $tr, gettext){
	$scope.sessionID = $rpc.$sid();
	$scope.uploadFilename = "/tmp/firmware.bin";
	$scope.uploadProgress = 0; 
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

	$scope.onStartUpgrade = function(){
		$rpc.juci.system.upgrade.start({"path": $scope.uploadPath, "keep": (($scope.keepSettings)?1:0)}).done(function(){
			// we never get here
		}); 
	}

	$scope.onCancelUpload = function(){
		$scope.uploading = false; 
	}

	function upgradeVerify(){
		$scope.upgradeVerification = true; 
		$scope.upgradeValid = $scope.upgradeInvalid = false; 
		$rpc.juci.system.upgrade.test({"path": $scope.uploadFilename}).done(function(result){
			if(result && result.error) {
				$scope.imageError = $tr(gettext("Image check failed:"))+result.stdout; 
				$scope.upgradeInvalid = true; 
				$scope.$apply(); 
				return; 
			}
			$scope.upgradeValid = true; 
		}).fail(function(){
			$scope.upgradeInvalid = true; 
		}).always(function(){
			$scope.upgradeVerification = false; 
			$scope.$apply();
		}); 
	}

	$scope.onSelectFile = function(ev){
		var input = ev.target; 
		var reader = new FileReader(); 
		function tobase64(arrayBuffer){
			return window.btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));
		}
		$scope.uploading = true; 
		$scope.upgradeUploaded = false; 
		reader.onload = function(){
			var buffer = reader.result; 
			var start = 0; 
			var slice = 10000; 
			var slices = 0; 
			var time = (new Date()).getTime(); 
			console.log("uploading file of size "+buffer.byteLength); 
			function doSpeedCalc(){
				setTimeout(function(){
					$scope.uploadSpeed = Math.round((slices * slice) / 1000) / 1000; 
					slices = 0; 
					if($scope.uploading) doSpeedCalc(); 
				}, 1000); 
			} doSpeedCalc(); 
			function next(){
				if((start + slice) > buffer.byteLength) slice = buffer.byteLength - start; 
				$rpc.file.write({
					seek: start, 
					length: slice, 
					data64: tobase64(buffer.slice(start, start + slice))
				}).done(function(){
					start += slice; 
					if(start >= buffer.byteLength){
						console.log("File uploaded!"); 
						$scope.uploading = false; 
						$scope.upgradeUploaded = true; 
						upgradeVerify(); 
						$scope.$apply(); 
					} else {
						slices++; 
						setTimeout(function(){ 
							$scope.uploadProgress = Math.round((start / buffer.byteLength) * 100); 
							$scope.$apply(); 
							if($scope.uploading) next(); 
						}, 0); 
					}
				}).fail(function(){
					console.error("File upload failed!"); 
					$scope.uploading = false; 
					$scope.$apply(); 
				}); 
			} next(); 
		}
		try {
			reader.readAsArrayBuffer(input.files[0]); 
		} catch(e){
			$scope.uploading = false; 
		}
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
}); 
