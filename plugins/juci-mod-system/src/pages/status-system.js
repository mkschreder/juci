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

UCI.juci.$registerSectionType("pagesystemstatus", {
	"show_meminfo": 	{ dvalue: true, type: Boolean }, 
	"show_diskinfo": 	{ dvalue: true, type: Boolean },
	"show_loadavg":		{ dvalue: false, type: Boolean }
}); 
UCI.juci.$insertDefaults("pagesystemstatus"); 

JUCI.app
.controller("StatusSystemPage", function ($scope, $rootScope, $uci, $rpc, gettext, $tr, $config) {
	$scope.changes = [];
	Object.keys($uci).map(function(x){
		var tmp = []
		if($uci[x].$getWriteRequests){
			tmp = $uci[x].$getWriteRequests();
		}
		tmp.map(function(ch){
			if(ch.values){
				Object.keys(ch.values).map(function(opt){
					var uciField = $uci[ch.config][ch.section][opt];
					if(uciField.ovalue instanceof Array){
						if(uciField.ovalue.length == uciField.uvalue.length){
							var eq = true;
							for(var i = 0; i < uciField.ovalue.length; i++){
								if(uciField.ovalue[i] != uciField.uvalue[i]) eq = false;
							}
							if(eq) return;
						}
					}		
					if(uciField.ovalue == uciField.uvalue) return;
					$scope.changes.push({ config:ch.config, section: ch.section, option: opt, uvalue:ch.values[opt], ovalue: uciField.ovalue })
				});
			}
		});
	});
	$scope.data = {changes: $scope.changes}

	$scope.systemStatusTbl = {
		rows: [["", ""]]
	}; 
	$scope.systemMemoryTbl = {
		rows: [["", ""]]
	}; 
	$scope.systemStorageTbl = {
		rows: [["", ""]]
	}; 
	var info = {};
	var sys = {};  
	var board = { release: {} }; 
	var filesystems = []; 

	var prev_cpu = {}; 

	JUCI.interval.repeat("status.system.refresh", 1000, function(resume){
		async.parallel([
			function (cb){$rpc.juci.system.info().done(function(res){info = res; cb();}).fail(function(res){cb();});},
			function (cb){$rpc.system.info().done(function(res){sys = res; cb();}).fail(function(res){cb();});},
			function (cb){
				if(!$rpc.system.board) cb(); 
				else $rpc.system.board().done(function(res){board = res; cb();}).fail(function(res){cb();});
			},
			function (cb){$rpc.juci.system.filesystems().done(function(res){
				filesystems = res.filesystems; 
				cb();
			}).fail(function(res){cb();});}
		], function(err){
			function timeFormat(secs){
				secs = Math.round(secs);
				var days = Math.floor(secs / (60 * 60 * 24)); 
				var hours = Math.floor(secs / (60 * 60));

				var divisor_for_minutes = secs % (60 * 60);
				var minutes = Math.floor(divisor_for_minutes / 60);

				var divisor_for_seconds = divisor_for_minutes % 60;
				var seconds = Math.ceil(divisor_for_seconds);
				
				function pad(a,b){return(1e15+a+"").slice(-b)}; 
				
				return ((days > 0)?""+days+"d ":"")+pad(hours,2)+":"+pad(minutes,2)+":"+pad(seconds,2);
			}
			
			var cpu_load = 0; 
			try {
				cpu_load = Math.round(100 * (prev_cpu.usr - info.system.cpu.usr) / (prev_cpu.total - info.system.cpu.total)); 
			} catch(e){ }
			prev_cpu = info.system.cpu; 

			$scope.systemStatusTbl.rows = [
				[$tr(gettext("Hostname")), board.hostname || info.system.name],
				[$tr(gettext("Model")), board.model || info.system.hardware || $tr(gettext("N/A"))],
				[$tr(gettext("Release")), board.release.description || info.system.firmware || $tr(gettext("N/A"))],
				[$tr(gettext("Firmware Version")), board.release.revision || $tr(gettext("N/A"))],
				[$tr(gettext("Local Time")), new Date(sys.localtime * 1000)],
				[$tr(gettext("Uptime")), timeFormat(sys.uptime)],
				[$tr(gettext("CPU")), ""+(cpu_load || 0)+"%"]
			]; 
			if($uci.juci["pagesystemstatus"] && $uci.juci["pagesystemstatus"].show_loadavg.value){
				$scope.systemStatusTbl.rows.push([$tr(gettext("System Load Avg. (1m)")), ""+(info.load.avg[0] / 10.0) + "%"]); 
			}
			if($config.local.mode == "expert"){
				var arr = $scope.systemStatusTbl.rows; 
				arr.push([$tr(gettext("Kernel Version")), board.kernel || info.system.kernel || $tr(gettext("N/A"))]); 
				arr.push([$tr(gettext("Filesystem")), info.system.filesystem || $tr(gettext("N/A"))]);
				arr.push([$tr(gettext("Target")), board.release.target || board.system || info.system.socver || $tr(gettext("N/A"))]);  
			}
			
			$scope.systemMemoryTbl.rows = [
				[$tr(gettext("Usage")), '<juci-progress value="'+Math.round((sys.memory.total - sys.memory.free) / 1000)+'" total="'+ Math.round(sys.memory.total / 1000) +'" units="kB"></juci-progress>'],
				[$tr(gettext("Shared")), '<juci-progress value="'+Math.round(sys.memory.shared / 1000)+'" total="'+ Math.round(sys.memory.total / 1000) +'" units="kB"></juci-progress>'],
				[$tr(gettext("Buffered")), '<juci-progress value="'+Math.round(sys.memory.buffered / 1000)+'" total="'+ Math.round(sys.memory.total / 1000) +'" units="kB"></juci-progress>'],
				[$tr(gettext("Swap")), '<juci-progress value="'+Math.round((sys.swap.total - sys.swap.free) / 1000)+'" total="'+ Math.round(sys.swap.total / 1000) +'" units="kB"></juci-progress>']
			];
			
			if($uci.juci["pagesystemstatus"] && $uci.juci["pagesystemstatus"].show_diskinfo.value){ 
				$scope.show_diskinfo = true; 
				$scope.systemStorageTbl.rows = []; 
				filesystems.map(function(disk){
					$scope.systemStorageTbl.rows.push([disk.filesystem+" ("+disk.path+")", '<juci-progress value="'+Math.round(disk.used)+'" total="'+ Math.round(disk.total) +'" units="kB"></juci-progress>']); 
				}); 
			}

			$scope.$apply(); 
			resume(); 
		});
	}); 
}); 

