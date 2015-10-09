//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("PageStatusPhone", function($scope, $rpc, $uci){
	if($rpc.asterisk){
		$scope.voice_available = true; 
		JUCI.interval.repeat("voice.status", 4000, function(done){
			$uci.$sync("voice_client").done(function(){
				var sipProviders = $uci.voice_client["@sip_service_provider"]; 
				var brcmLines = $uci.voice_client["@brcm_line"]; 
				$rpc.asterisk.status().done(function(data){
					if(data && data.sip){
						var accounts = []; 
						var lines = []; 
						Object.keys(data.sip).map(function(k){
							var config = sipProviders.find(function(x){ return x[".name"] == k; }); 
							if(config){
								data.sip[k][".config"] = config; 
								accounts.push(data.sip[k]); 
							}
						}); 
						Object.keys(data.brcm).map(function(k){
							var config = brcmLines.find(function(x){ return x[".name"] == k; }); 
							if(config){
								data.brcm[k][".config"] = config; 
								lines.push(data.brcm[k]); 
							}
						}); 
						$scope.sipAccounts = accounts; 
						$scope.brcmLines = lines; 
						$scope.$apply(); 
						done(); 
					}
				});
			}); 
		}); 
	}
}); 
