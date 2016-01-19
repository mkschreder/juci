//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("phoneSipServiceProvider", function(){
	return {
		scope: true,
		templateUrl: "widgets/sip-service-provider.html",
		replace: true,
		controller: "sipServiceProviderCtrl"
	};
}).controller("sipServiceProviderCtrl", function($scope, $uci, $tr, gettext){
	$uci.$sync(["voice_client"]).done(function(){
		$scope.providers = $uci.voice_client["@sip_service_provider"];
		$scope.$apply();
	});
	$scope.onAddProvider = function(){
		var number = 0;
		while(number < 100){
			if($scope.providers.filter(function(x){return (x[".name"].split("p")[1] == number)}).length > 0)number ++;
			else break;
		}
		$uci.voice_client.$create({
			".type":"sip_service_provider", 
			".name":"sip" + number, 
			name:"Account " + number,
			codec0: "alaw",
			ptime_alaw: 20,
			transport: "udp"
			}).done(function(){$scope.$apply()
		});
	};
	$scope.onDeleteProvider = function(item){
		if(!item) return;
		item.$delete().done(function(){$scope.$apply()});
	};
	$scope.getProviderTitle = function(item){
		var title = (item.name.value == '') ? item.user.value : item.name.value;
		if(title == "") return "Unnamed Account"
		else return title;
	};
	$scope.targets = [{ label: $tr(gettext("Direct")),	value: "direct"  }];
});
