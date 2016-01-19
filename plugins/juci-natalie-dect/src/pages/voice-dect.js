//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.controller("PhoneDectPage", function($uci, $scope, $rpc, gettext, $tr, $events){
	$uci.$sync("dect").done(function(){
		$scope.dect = $uci.dect.dect;
		$scope.$apply();
	});
	$events.subscribe("ubus.object.add", function(event){
		if(event.data.path.split(".")[2] == "handset"){
			$scope.dismissed = true;
		}
	});
	$scope.dectModes = [
		{ label: $tr(gettext("Auto")),	value: "auto" },
		{ label: $tr(gettext("On")),	value: "on" },
		{ label: $tr(gettext("Off")),	value: "off" }
	];
	var timer;
	$scope.dismissed = true;
	$scope.onCancelDECT = function(){
		$scope.dismissed = true;
		clearTimeout(timer);
	};
	$scope.toHexaDecimal = function(string){
		var ret = "";
		for(var i = 0; i < string.length;i+=2){
			ret += string.substr(i, 2) + " ";
		}
		return ret;
	};
	if($rpc.sys && $rpc.sys.dect){
		JUCI.interval.repeat("dect.refresh", 1000, function(done){
			$rpc.sys.dect.status().done(function(stats){
				$scope.status = stats;
				$scope.$apply();
				done();
			});
		});
		$scope.onStartPairing = function(){
			$scope.dismissed = false;
			$rpc.sys.dect.pair().done(function(){});
			timer = setTimeout(function(){$scope.dismissed = true;}, 1000*180);
		}
		$scope.onPingHandset = function(hs){
			$rpc.sys.dect.ping({ id: hs.id }).done(function(){
			});
		}
	}
});
