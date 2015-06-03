//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
 
JUCI.app
.controller("PhoneCallLogPageCtrl", function($scope, $uci, gettext, $tr, $rpc){ 
	$scope.phoneFilter = ""; 
	$scope.phoneFilterSelected = {}; 
	$scope.phoneList = []; 
	$scope.call_log = []; 
	JUCI.interval.repeat("call_log", 2000, function(done){
		$rpc.asterisk.call_log.list().done(function(res){
			var unique_phones = {}; 
			$scope.call_log = res.call_log.map(function(log){
				var parts = log.time.split(" "); 
				var date = new Date(parts[0]); 
				var time = new Date(parts[1]); 
				var now = new Date(); 
				if(now.getDate() == date.getDate() && now.getMonth() == date.getMonth() && date.getFullYear() == now.getFullYear())
					log.date = $tr(gettext("Today")); 
				else 
					log.date = date.getDate() + ":"+date.getMonth()+":"+date.getFullYear(); 
				log.time = parts[1]; 
				if(log.direction == "INCOMING") unique_phones[log.to] = true; 
				if(log.direction == "OUTGOING") unique_phones[log.from] = true; 
				log.class = {
					'text-success': log.disposition == 'ANSWERED', 
					'text-danger': log.disposition == "NO ANSWER"
				}
				return log; 
			}); 
			$scope.phoneList = Object.keys(unique_phones).map(function(x){ return { label: x, id: x }; }); 
			$scope.phoneFilter = ""; 
			$scope.$apply(); 
			done(); 
		}); 
	}); 
	$scope.onChangeFilter = function(){
		$scope.phoneFilter = $scope.phoneFilterSelected.id; 
	}
}); 
