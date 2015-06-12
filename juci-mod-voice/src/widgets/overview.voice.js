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
}); 
