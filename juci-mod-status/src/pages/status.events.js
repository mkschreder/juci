//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("StatusEventsPageCtrl", function($scope, $rpc){
	var allLogTypes = ["error", "warning", "info"]; 
	$scope.selectedShowType = allLogTypes; 
	$scope.selectedLogTypes = ["system", "network", "other"]; 
	
	var groups = {
		"system": ["dropbear", "peripheral_manager"], 
		"network": ["netifd", "brcmnetlink", "dnsmasq-dhcp", "dnsmasq"]
	}; 
	
	JUCI.interval.repeat("syslog", 1000, function(done){
		$rpc.luci2.system.syslog().done(function(result){
			if(result && result.log){
				$scope.logs = result.log.split("\n").map(function(line){
					var fields = line.match(/(\w* \w* \w* \d{2}:\d{2}:\d{2} \d{4}) ([^\s]*) ([^\s:]*): (.*)/); 
					if(fields){
						// remove first one because it is the whole line
						fields.shift(); 
						fields[0] = new Date(fields[0]); 
					}
					return fields; 
				})
				.filter(function(x){ 
					// Epic ugliness
					// TODO: fix up the log parsing code
					if(x == null || x[2] == "kernel" || x[2] == "syslog") return false; 
					x[2] = x[2].replace(/\[.*\]/gi, ""); 
					var visible = false; 
					var error = false, warning = false, info = false; 
					if(x[1].indexOf("error") >= 0) error = true; 
					if(x[1].indexOf("warn") >= 0) warning = true; 
					if(x[1].indexOf("notice") >= 0) info = true; 
					if(error && $scope.selectedShowType.indexOf("error") == -1) return false; 
					if(warning && $scope.selectedShowType.indexOf("warning") == -1) return false; 
					if(info && $scope.selectedShowType.indexOf("info") == -1) return false; 
					if(!error && !warning && !info && $scope.selectedLogTypes.indexOf("other") >= 0) visible = true; 
					$scope.selectedLogTypes.map(function(t){
						if(groups[t] && groups[t].indexOf(x[2]) >= 0) visible = true; 
					}); 
					return visible; 
				}) // filter out all invalid matches 
				.reverse() // sort by date in descending order
				.map(function(x){ // convert date back to string and shorten it's format
					var d = x[0]; 
					x[0] = d.getFullYear()+"-"+("00"+(d.getMonth()+1)).slice(-2)+"-"+d.getDate()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
					//x[0] = x[0].toLocaleFormat("%d-%b-%Y %H:%M:%S"); 
					return x; 
				}); 
				$scope.$apply(); 
				done(); 
			}
		}); 
	}); 
	$scope.allLogTypes = [
		{ label: "System", value: "system" }, 
		//{ label: "WAN", value: "wan" }, 
		{ label: "Network", value: "network" }, 
		{ label: "Other", value: "other" }
		//{ label: "LAN", value: "lan" }, 
		//{ label: "Voice", value: "voice" }, 
		//{ label: "Data", value: "data" }, 
		//{ label: "IPTV", value: "iptv" }, 
		//{ label: "USB", value: "usb" }, 
		//{ label: "Firewall", value: "firewall" }
	]; 
	$scope.allEventTypes = [
		{ label: "Only Errors & Warnings", value: ["error", "warning"] }, 
		{ label: "All Events", value: ["error", "warning", "info"] }
	];
	$scope.lineClass = function(line){
		if(line[1].indexOf("error") >= 0) return "label-danger"; 
		if(line[1].indexOf("warn") >= 0) return "label-warning";  
		if(line[1].indexOf("notice") >= 0) return "label-info"; 
		return ""; 
	}
	
	function onChange(){
		console.log(JSON.stringify($scope.selectedLogTypes) + $scope.selectedShowType); 
	}
	$scope.onTypeChanged = function(){
		onChange(); 
	}
	$scope.$watchCollection("selectedLogTypes", function(){ onChange(); }); 
}); 
