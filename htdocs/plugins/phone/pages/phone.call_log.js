//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
 
JUCI.app
.controller("PhoneCallLogPageCtrl", function($scope, $uci, gettext, $tr, $rpc){ 
	$scope.phoneFilter = ""; 
	$scope.phoneFilterSelected = {}; 
	$scope.phoneList = []; 
	$scope.call_log = []; 
	$rpc.asterisk.call_log.list().done(function(res){
		var unique_phones = {}; 
		$scope.call_log = res.call_log.map(function(log){
			var date = new Date(log.time.replace(/CEST/g, "")); 
			var now = new Date(); 
			if(now.getDate() == date.getDate() && now.getMonth() == date.getMonth() && date.getFullYear() == now.getFullYear())
				log.date = $tr(gettext("Today")); 
			else 
				log.date = date.getDate() + ":"+date.getMonth()+":"+date.getFullYear(); 
			log.time = date.getHours()+":"+("0"+date.getMinutes()).slice(-2); 
			if(log.direction == "Incoming") unique_phones[log.to] = true; 
			if(log.direction == "Outgoing") unique_phones[log.from] = true; 
			return log; 
		}); 
		$scope.phoneList = Object.keys(unique_phones).map(function(x){ return { label: x, id: x }; }); 
		$scope.phoneFilter = ""; 
		$scope.$apply(); 
	}); 
	$scope.onChangeFilter = function(){
		$scope.phoneFilter = $scope.phoneFilterSelected.id; 
	}
}); 
