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
.controller("StatusEventsPageCtrl", function($scope, $rpc, $config, $tr, gettext){
	var log = {
		autoRefresh : true
	};
	var timeoutID = undefined;
	var request = null;
	$scope.data = { limit: 20, filter: "", type: "" };
	$scope.sid = $rpc.$sid(); 
	$scope.filters = [];
	
	$config.settings.juci_event.filter.value.map(function(x){
		var filter = x.split(".")[0];
		var id = x.split(".")[1];
		if(inFilters(filter) == -1) $scope.filters.push({name:filter, filters:[id], checked:false});
		else $scope.filters[inFilters(filter)].filters.push(id);
	});

	function inFilters(filter){
		for(var i = 0; i < $scope.filters.length; i++){
			if($scope.filters[i].name == filter) return i;
		}
		return -1;
	};
	
	$scope.allLimits = [
		{ label: 20, value: 20 }, 
		{ label: 50, value: 50 }, 
		{ label: 100, value: 100 }, 
		{ label: 200, value: 200 }
	]; 
	$scope.types = [
		{ label:$tr(gettext("All types")),		value: "" },
		{ label:$tr(gettext("Emergency")),		value: "emerg" },
		{ label:$tr(gettext("Alert")),			value: "alert" },
		{ label:$tr(gettext("Critical")),		value: "crit" },
		{ label:$tr(gettext("Warning")),		value: "warn" },
		{ label:$tr(gettext("Notice")),			value: "notice" },
		{ label:$tr(gettext("Informational")),	value: "info" },
		{ label:$tr(gettext("Debug")),			value: "debug" }
	];

	function update(){
		var limit = "";
		$scope.filters.map(function(x){
			if(!x.checked) return;
			x.filters.map(function(lim){
				limit += lim + "\|";
			});
		});
		if($scope.data.filter == "") limit = limit.slice(0, -1);
		else limit += $scope.data.filter;
		if(request === null){
			request = $rpc.juci.system.log({
				limit: $scope.data.limit, 
				filter: limit,
				type: $scope.data.type
			}).done(function(result){
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
	
	$scope.onDownloadLogs = function(){
		$rpc.juci.logs.download().done(function(result){
			if(result.id) window.open(window.location.origin+"/cgi-bin/juci-download?id="+result.id); 
			else alert($tr(gettext("Could not download logs!"))); 
		}); 
	}

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
