//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.directive("overviewWidget20Voice", function(){
	return {
		templateUrl: "widgets/overview.voice.html", 
		controller: "overviewWidgetVoice", 
		replace: true
	 };  
})
.directive("overviewStatusWidget20Voice", function(){
	return {
		templateUrl: "widgets/overview.voice.small.html", 
		controller: "overviewWidgetVoice", 
		replace: true
	 };  
})
.controller("overviewWidgetVoice", function($scope, $rpc, $uci, $tr, gettext){
	$scope.sipAccounts = []; 
	$scope.phoneSchedStatus = gettext("off"); 
	$scope.str_unknown = $tr(gettext("Unknown"));

	JUCI.interval.repeat("load-phone-small-widget", 5000, function(done){
		async.series([
			function(next){
				$uci.$sync(["voice_client"]).done(function(){
					$scope.voice_client = $uci.voice_client; 
					$scope.phoneSchedStatus = ($scope.voice_client.RINGING_STATUS.enabled.value)?gettext("on"):gettext("off");
					if($uci.voice_client && $uci.voice_client["@sip_service_provider"]){
						$scope.sipAccounts = $uci.voice_client["@sip_service_provider"]; 
					}
					$scope.showVoiceWidget = true; 
				}).always(function(){ next(); }); 
			},
			function(next){
				$rpc.asterisk.status().done(function(data){
					$scope.online = false;
					$scope.sipAccounts.map(function(acc){
						if(data.sip && data.sip[acc[".name"]]){
							var tmp = data.sip[acc[".name"]];
							if(tmp.registered){
								$scope.online = true;
								acc.$icon = "fa fa-check-circle fa-2x text-success";
							}else if(tmp.registry_request_sent){
								acc.$icon = "fa fa-spinner fa-2x fa-spin text-warning";
							}else{
								acc.$icon = "fa fa-times-circle fa-2x";
							}
						}
					});
				}).always(function(){next();});	
			}], function(){
			$scope.$apply(); 
			done();
		}); 
	});
	$scope.onPhoneToggle = function(){
		var status = $uci.voice_client.RINGING_STATUS; 
		if(status){
			status.enabled.value = !status.enabled.value; 
		}
	}
}); 
