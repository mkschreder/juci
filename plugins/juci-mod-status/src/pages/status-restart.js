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
.controller("StatusRestartPageCtrl", function($scope, $rpc){
	$scope.onRestart = function(){
		$scope.showConfirmation = 1; 
		/*$rpc.juci.system.reboot().done(function(){
			console.log("Restarting the system..."); 
		}); */
	}
	
	function waitUntilDown(){
		var deferred = $.Deferred(); 
		var rpc = false; 
		var interval = setInterval(function(){
			if(!rpc){
				rpc = true; 
				$rpc.session.access().done(function(){
					
				}).fail(function(){
					clearInterval(interval); 
					deferred.resolve(); 
				}).always(function(){
					rpc = false; 
				}); 
			}
		}, 1000); 
		return deferred.promise(); 
	}
	$scope.onConfirmRestart = function(){
		$scope.showRestartProgress = 1; 
		$scope.showConfirmation = 0; 
		$scope.progress = 0; 
		$rpc.juci.system.reboot().done(function(){
			var rpc = true; 
			$scope.message = "Waiting for reboot..."; 
			$scope.$apply(); 
			var interval = setInterval(function(){
				$scope.progress++; 
				$scope.$apply(); 
				if(!rpc){
					rpc = true; 
					$rpc.$authenticate().done(function(){
						// it will not succeed anymore because box is rebooting
					}).fail(function(){
						//$scope.showConfirmation = 0; 
						$scope.$apply(); 
						window.location.reload(); 
					}).always(function(){
						rpc = false; 
					}); 
				}
			}, 1000); 
			
			waitUntilDown().done(function(){
				$scope.message = "Host is rebooting..."; 
				$scope.$apply(); 
				rpc = false; 
			}); 
			console.log("Restarting the system..."); 
		});
	}
	$scope.onCancelRestart = function(){
		$scope.showConfirmation = 0; 
	}
}); 
