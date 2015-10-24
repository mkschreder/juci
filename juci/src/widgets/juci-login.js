//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("juciLogin", function(){
	return {
		// accepted parameters for this tag
		scope: {
		}, 
		templateUrl: "/widgets/juci-login.html", 
		replace: true, 
		controller: "LoginControl",
		controllerAs: "ctrl"
	}; 
})
.controller("LoginControl", function($scope, $config, $state, 
	$window, $rpc, $localStorage, gettext){
	$scope.form = { 
		"username": "", 
		"password": "", 
		"remember": 0, 
		"host": "" 
	}; 
	$scope.showlogin = $config.showlogin; 
	$scope.form.username = $config.defaultuser||"admin"; 
	$scope.connecting = true; 

	$scope.errors = []; 
	$scope.showHost = 0; 
	if($rpc.local){
		$rpc.local.features().done(function(features){
			if(features.list) features.list.map(function(x){
				if(x.indexOf("rpcforward") == 0) {
					$scope.showHost = 1; 
					$scope.form.host = $localStorage.getItem("rpc_host")||""; 
				}
			}); 
			$scope.$apply(); 
		}); 
	}

	JUCI.interval.repeat("login-connection-check", 5000, function(done){
		$rpc.$isConnected().done(function(){
			$scope.is_connected = true; 
		}).fail(function(){
			$scope.is_connected = false; 
		}).always(function(){
			$scope.connecting = false; 
			$scope.$apply(); 
			done(); 
		}); 
	}); 
	$scope.doLogin = function(){
		var deferred = $.Deferred(); 
		$scope.errors = []; 
		async.series([
			function(next){
				if($scope.form.host.length > 0){
					$rpc.local.set_rpc_host({"rpc_host": $scope.form.host})
					.done(function(){
						$localStorage.setItem("rpc_host", $scope.form.host); 
					})
					.always(function(){next();}); 
				} else {
					next(); 
				}
			}, 
			function(next){
				$rpc.$login({
					"username": $scope.form.username, 
					"password": $scope.form.password, 
					"remember": $scope.form.remember
				}).done(function success(res){
					//$state.go("home", {}, {reload: true});
					$window.location.href="/"; 
					deferred.resolve(); 
				}).fail(function fail(res){
					//$scope.errors.push(res); 
					$scope.errors.push(gettext("Please enter correct username and password!"));
					$scope.$apply(); 
					deferred.reject(); 
				}); 
			}
		]); 
		return deferred.promise(); 
	}
	$scope.doLogout = function(){
		var deferred = $.Deferred(); 
		$rpc.$logout().done(function(){
			console.log("Logged out!"); 
			//$state.go("home", {}, {reload: true});
			JUCI.redirect("overview"); //$window.location.href="/"; 
			deferred.resolve(); 
		}).fail(function(){
			console.error("Error logging out!");
			deferred.reject(); 
		});  
		return deferred.promise(); 
	}
	
}); 
		
