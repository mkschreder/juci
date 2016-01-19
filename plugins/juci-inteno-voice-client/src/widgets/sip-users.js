//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("phoneSipUsers", function(){
	return {
		scope: true,
		templateUrl: "widgets/sip-users.html",
		replace: true,
		controller: "sipUsersCtrl"
	};
}).controller("sipUsersCtrl", function($scope, $uci, $tr, gettext){
	$uci.$sync(["voice_client"]).done(function(){
		$scope.users = $uci.voice_client["@sip_user"];
		$scope.$apply();
	});
	$scope.onAddUser = function(){
		var number = 0;
		while(number < 100){
			if($scope.users.filter(function(x){return (x[".name"].split("r")[1] == number)}).length > 0)number ++;
			else break;
		}
		$uci.voice_client.$create({
			".type":"sip_user", 
			".name":"sip_user" + number, 
			name:"New SIP user",
			codec0: "alaw"
			}).done(function(){$scope.$apply()
		});
	};
	$scope.onDeleteUser = function(user){
		if(!user) return;
		user.$delete().done(function(){$scope.$apply()});
	};
	$scope.getUserTitle = function(user){
		return (user.name.value !== "") ? user.name.value : "Unnamed user";
	};
});
