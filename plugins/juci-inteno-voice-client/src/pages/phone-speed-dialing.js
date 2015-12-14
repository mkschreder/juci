//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
/*
 * juci - javascript universal client interface
 *
 * Project Author: Martin K. Schröder <mkschreder.uk@gmail.com>
 * 
 * Copyright (C) 2012-2013 Inteno Broadband Technology AB. All rights reserved.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA
 */
 
JUCI.app
.controller("PagePhoneSpeedDialing", function($scope, $uci){
	$scope.speed_dials = []; 
	$scope.speed_dialing = true; 
	
	$scope.$watch("speed_dials", function(){
		var dials = {}; 
		$scope.speed_dials.map(function(x){ if(x.number != "") dials[x.tone] = x; }); 
		async.eachSeries(Object.keys(dials), function(k, next){
			if(!dials[k].exists){
				$uci.voice_client.create({".type": "speed_dial"}).done(function(section){
					section.tone.value = dials[k].tone; 
					section.number.value = dials[k].number; 
					dials[k].exists = true;  
				}).always(function(){
					next(); 
				}); 
			} else {
				next(); 
			}
		}, function(){
			Object.keys($scope.speed_dials).map(function(k){
				var dial = $scope.speed_dials[k]; 
				var section = $uci.voice_client["@speed_dial"].find(function(x){ return x.tone.value == dial.tone; }); 
				if(section){
					section.tone.value = dial.tone; 
					section.number.value = dial.number; 
				}
			}); 
		}); 
	}, true); 
	
	function resync(){
		$uci.$sync("voice_client").done(function(){
			var dials = {}; 
			$uci.voice_client["@speed_dial"].map(function(x){
				dials[x.tone.value] = {
					tone: x.tone.value, 
					number: x.number.value, 
					exists: true
				};
			});  
			for(var c = 0; c < 10; c++){
				if(!(dials[c])) dials[c] = {
					tone: c, 
					number: ""
				}
			}
			$scope.speed_dials = Object.keys(dials).map(function(x){ return dials[x]; }); 
			$scope.$apply(); 
		}); 
	} resync(); 
	
	$scope.onClearAll = function(){
		var dials = $uci.voice_client["@speed_dial"].map(function(x){ return x; }); 
		async.eachSeries(dials, function(dial, next){
			dial.$delete().always(function(){ next(); }); 
		}, function(){
			console.log("Save!"); 
			$uci.save().done(function(){
				console.log("resync"); 
				resync(); 
			}); 
		}); 
	}
}); 
