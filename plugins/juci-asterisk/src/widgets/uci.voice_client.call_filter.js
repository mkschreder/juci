//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app.directive("uciVoiceClientCallFilterEdit", function(){
	var plugin_root = JUCI.module("phone").plugin_root; 
	return {
		restrict: "E", 
		templateUrl: plugin_root+"/widgets/uci.voice_client.call_filter.html", 
		controller: "uciVoiceClientCallFilterEdit"
	}
})
.controller("uciVoiceClientCallFilterEdit", function($scope, $uci){
	
}); 
