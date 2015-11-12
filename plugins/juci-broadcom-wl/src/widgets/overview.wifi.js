//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("overviewWidget00Wifi", function(){
	return {
		templateUrl: "widgets/overview.wifi.html", 
		controller: "overviewWidgetWifi", 
		replace: true
	 };  
})
.directive("overviewStatusWidget00Wifi", function(){
	return {
		templateUrl: "widgets/overview.wifi.small.html", 
		controller: "overviewStatusWidgetWifi", 
		replace: true
	 };  
})
.controller("overviewStatusWidgetWifi", function($scope, $uci, $rpc){
	JUCI.interval.repeat("overview-wireless", 1000, function(done){
		async.series([function(next){
			$uci.$sync(["wireless"]).done(function(){
				$scope.wireless = $uci.wireless;  
				if($uci.wireless && $uci.wireless.status) {
					if($uci.wireless.status.wlan.value){
						$scope.statusClass = "text-success"; 
					} else {
						$scope.statusClass = "text-default"; 
					}
				}
				$scope.$apply(); 
				next(); 
			}); 
		}, function(next){
			$rpc.juci.wireless.clients().done(function(result){
				$scope.done = 1; 
				var clients = {}; 
				result.clients.map(function(x){ 
					if(!clients[x.band]) clients[x.band] = []; 
					clients[x.band].push(x); 
				}); 
				$scope.wifiClients = clients; 
				$scope.wifiBands = Object.keys(clients); 
				$scope.$apply(); 
			}); 
		}], function(){
			done(); 
		}); 
	}); 
	
})
.controller("overviewWidgetWifi", function($scope, $rpc, $uci, $tr, gettext, $juciDialog){
	$scope.wireless = {
		clients: []
	}; 
	$scope.wps = {}; 
	
	$scope.onWPSToggle = function(){
		$uci.wireless.status.wps.value = !$uci.wireless.status.wps.value; 
		$scope.wifiWPSStatus = (($uci.wireless.status.wps.value)?gettext("on"):gettext("off")); 
		$uci.save().done(function(){
			refresh(); 
		}); 
	}
	$scope.onWIFISchedToggle = function(){
		$uci.wireless.status.schedule.value = !$uci.wireless.status.schedule.value; 
		$scope.wifiSchedStatus = (($uci.wireless.status.schedule.value)?gettext("on"):gettext("off")); 
		$uci.save().done(function(){
			refresh(); 
		}); 
	}

	$scope.onEditSSID = function(iface){
		$juciDialog.show("uci-wireless-interface", {
			title: $tr(gettext("Edit wireless interface")),  
			on_apply: function(btn, dlg){
				$uci.$save(); 
				return true; 
			}, 
			model: iface.uci_dev
		}).done(function(){
		
		}); 
	}

	function refresh() {
		var def = $.Deferred(); 
		$scope.wifiSchedStatus = gettext("off"); 
		$scope.wifiWPSStatus = gettext("off"); 
		async.series([
			function(next){
				$uci.$sync("wireless").done(function(){
					$rpc.juci.wireless.devices().done(function(result){
						$scope.wifi = $uci.wireless;  
						$scope.vifs = result.devices.map(function(dev){
							if(dev.ssid == "") return null; 
							var uci_dev = $uci.wireless["@wifi-iface"].find(function(w){
								return w.ifname.value == dev.device; 
							}); 
							dev.uci_dev = uci_dev; 
							return dev; 
						}).filter(function(x){ return x != null; });  
						if($uci.wireless && $uci.wireless.status) {
							$scope.wifiSchedStatus = (($uci.wireless.status.schedule.value)?gettext("on"):gettext("off")); 
							$scope.wifiWPSStatus = (($uci.wireless.status.wps.value)?gettext("on"):gettext("off")); 
						}
					}).always(function(){ next(); }); 
				}); 
			}, 
			function(next){
				if(!$rpc.juci.wireless || !$rpc.juci.wireless.wps) { next(); return; }
				$rpc.juci.wireless.wps.showpin().done(function(result){
					$scope.wps.pin = result.pin; 
				}).always(function(){ next(); }); 
			}, 
			function(next){
				$rpc.juci.wireless.clients().done(function(clients){
					$scope.wireless.clients = clients.clients; 
					$scope.wireless.clients.map(function(cl){
						// check flags 
						if(cl.flags.match(/NOIP/)) cl.ipaddr = $tr(gettext("No IP address")); 
					}); 
					next(); 
				}).fail(function(){
					next();
				});
			},
		], function(){
			$scope.$apply(); 
			def.resolve(); 
		}); 
		return def.promise(); 
	}; 
	JUCI.interval.repeat("wifi-overview", 10000, function(done){
		refresh().done(function(){
			done(); 
		}); 
	}); 
}); 
