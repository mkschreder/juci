//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("phoneSipAdvanced", function(){
	return {
		scope: true,
		templateUrl: "widgets/sip-advanced.html",
		replace: true,
		controller: "sipAdvancedCtrl"
	};
}).controller("sipAdvancedCtrl", function($scope, $uci, $tr, gettext, $network, $rpc){
	$scope.ssl = {};
	$rpc.juci.voice_client.get_trusted_ca().done(function(data){
		$scope.ssl.ovalue = $scope.ssl.value = data.result;
		$scope.$apply();
	});
	$scope.save_ssl = function(){
		console.log($scope.ssl.value);
		var test = $scope.ssl.value.split("\n").join("\n\r");
		$rpc.juci.voice_client.set_trusted_ca({data:test}).done(function(data){
			if(data.result == "success"){
				$scope.ssl.ovalue = $scope.ssl.value;
				$scope.ssl.saved = true;
				$scope.$apply();
			}
			console.log(data);
		});
	};
	$uci.$sync("voice_client").done(function(){
		$scope.sip = $uci.voice_client.SIP; 
		$scope.proxys = $scope.sip.sip_proxy.value.map(function(x){return {label: x}});
		$scope.localnets = $scope.sip.localnet.value.map(function(x){return {label: x}});
		$scope.$apply();
	});
	$scope.ssl_versions = [
		{ label: $tr(gettext("TLS v1")),	value: "tlsv1" },
		{ label: $tr(gettext("SSL v2")),	value: "sslv2" },
		{ label: $tr(gettext("SSL v3")),	value: "sslv3" }
	];
	$network.getWanNetworks().done(function(data){
		$scope.wan_networks = data.map(function(x){return { label: String(x[".name"]).toUpperCase(), value: x[".name"] }; });
		$scope.wan_networks.push({ label: $tr(gettext("Listen on all interfaces")),	value: "" });
		$scope.$apply();
	});
	$scope.onProxyAdded = function(){
		$scope.sip.sip_proxy.value = $scope.proxys.map(function(x){return x.label});
	};
	$scope.check_range = function(value){
		if($scope.sip.rtpstart.value > $scope.sip.rtpend.value){	
			$scope.sip.rtpstart.value = $scope.sip.rtpend.value = value;
		}
	};
	$scope.congest_tones = [
		{ label: $tr(gettext("Congestion")),	value: "congestion" },
		{ label: $tr(gettext("Info")),			value: "info" }
	];
	$scope.dtmf_modes = [
		{ label: $tr(gettext("Compatibility")),	value: "compatibility" },
		{ label: $tr(gettext("RFC 2833")),	value: "rfc2833" },
		{ label: $tr(gettext("SIP INFO")),	value: "info" },
		{ label: $tr(gettext("Inband")),	value: "inband" },
	];
	$scope.onLocalnetAdded = function(){
		$scope.sip.localnet.value = $scope.localnets.map(function(x){return x.label});
	};
});
