//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.directive("overviewWidget20Voice", function(){
	return {
		templateUrl: "widgets/overview.voice.html", 
		controller: "overviewWidgetVoice", 
		replace: true
	 };  
})
.controller("overviewWidgetVoice", function($scope, $rpc, $uci, $config, $tr, gettext){
	$scope.sipAccounts = []; 
	$scope.phoneSchedStatus = gettext("off"); 
	async.series([
		function(next){
			$uci.sync(["wireless", "boardpanel", "voice_client"]).done(function(){
				$scope.voice_client = $uci.voice_client; 
				if($uci.voice_client && $uci.voice_client["@sip_service_provider"]){
					$scope.sipAccounts = $uci.voice_client["@sip_service_provider"]; 
				}
			}).always(function(){ next(); }); 
		}], function(){
		$scope.$apply(); 
	}); 
	$scope.onPhoneToggle = function(){
		var status = $uci.voice_client.RINGING_STATUS; 
		if(status){
			status.enabled.value = !status.enabled.value; 
			$scope.phoneSchedStatus = ((status.enabled.value)?gettext("on"):gettext("off")); 
			$uci.save().done(function(){
				refresh(); 
			}); 
		}
	}
}); 
