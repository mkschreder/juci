//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("StatusSystemPage", function ($scope, $rootScope, $rpc, gettext, $tr) {
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
	var disk = {}; 
	
	JUCI.interval.repeat("status.system.refresh", 1000, function(resume){
		async.parallel([
			function (cb){$rpc.router.info().done(function(res){info = res; cb();}).fail(function(res){cb();});},
			function (cb){$rpc.system.info().done(function(res){sys = res; cb();}).fail(function(res){cb();});},
			function (cb){$rpc.luci2.system.diskfree().done(function(res){disk = res; cb();}).fail(function(res){cb();});}
		], function(err, next){
			$scope.systemStatusTbl.rows = [
				[$tr(gettext("Hostname")), info.system.name],
				[$tr(gettext("Model")), info.system.nvramver],
				[$tr(gettext("Firmware Version")), info.system.firmware],
				[$tr(gettext("Kernel Version")), info.system.kernel],
				[$tr(gettext("Local Time")), new Date(sys.localtime)],
				[$tr(gettext("Uptime")), info.system.uptime],
				//[$tr(gettext("Load Average")), sys.load[0] + " " + sys.load[1] + " " + sys.load[2]]
			]; 
			$scope.systemMemoryTbl.rows = [
				[$tr(gettext("Usage")), '<luci-progress value="'+Math.round((sys.memory.total - sys.memory.free) / 1000)+'" total="'+ Math.round(sys.memory.total / 1000) +'" units="kB"></luci-progress>'],
				[$tr(gettext("Shared")), '<luci-progress value="'+Math.round(sys.memory.shared / 1000)+'" total="'+ Math.round(sys.memory.total / 1000) +'" units="kB"></luci-progress>'],
				[$tr(gettext("Buffered")), '<luci-progress value="'+Math.round(sys.memory.buffered / 1000)+'" total="'+ Math.round(sys.memory.total / 1000) +'" units="kB"></luci-progress>'],
				[$tr(gettext("Swap")), '<luci-progress value="'+Math.round((sys.swap.total - sys.swap.free) / 1000)+'" total="'+ Math.round(sys.swap.total / 1000) +'" units="kB"></luci-progress>']
			];
			$scope.systemStorageTbl.rows = [
				[$tr(gettext("Root Usage (/)")), '<luci-progress value="'+Math.round(disk.root.used / 1000)+'" total="'+ Math.round(disk.root.total / 1000) +'" units="kB"></luci-progress>'],
				[$tr(gettext("Temporary Usage (/tmp)")), '<luci-progress value="'+Math.round(disk.tmp.used / 1000)+'" total="'+ Math.round(disk.tmp.total / 1000) +'" units="kB"></luci-progress>']
			]; 
			$scope.$apply(); 
		}, function(){
			resume(); 
		});
	}); 
}); 
