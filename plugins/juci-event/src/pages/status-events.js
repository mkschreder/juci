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
.controller("StatusEventsPageCtrl", function($scope, $rpc){
	var log = {
		autoRefresh : true
	};
	var timeoutID = undefined;
	var request = null;
	$scope.data = { limit: 20, filter: "" };
	$scope.sid = $rpc.$sid(); 

	$scope.allLimits = [
		{ label: 20, value: 20 }, 
		{ label: 50, value: 50 }, 
		{ label: 100, value: 100 }, 
		{ label: 200, value: 200 }
	]; 
	function update(){
		if(request === null){
			request = $rpc.juci.system.log({
				limit: $scope.data.limit, 
				filter: $scope.data.filter
			}).done(function(result){
				console.log("test "+$scope.data.filter+" "+result.lines);
				if(result && result.lines){
					$scope.logs = result.lines; 
					$scope.$apply();
				}
			}).always(function(){
				request = null;
			}); 
		}
		return request;
	}

	$scope.applyFilter = function(){
		$scope.inprogress = true;
		if(typeof timeoutID === "number"){
			clearTimeout(timeoutID);
		}
		log.autoRefresh = false;
		timeoutID = setTimeout(function(){log.autoRefresh = true;}, 1000);
		update().always(function() {
			$scope.inprogress = false;
			$scope.$apply();	
		});
	};

	JUCI.interval.repeat("syslog", 1000, function(done){
		if(!log.autoRefresh){
			done();
			return;
		}
		update().always(function(){
			done();
		});;
	}); 

	$scope.lineClass = function(line){
		if(line.type.indexOf("error") >= 0) return "label-danger"; 
		if(line.type.indexOf("warn") >= 0) return "label-warning";  
		if(line.type.indexOf("notice") >= 0 || line.type.indexOf("info") >= 0) return "label-info"; 
		return ""; 
	}
}); 
