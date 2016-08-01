/*	
	This file is part of JUCI (https://github.com/mkschreder/juci.git)

	Copyright (c) 2015 Martin K. Schröder <mkschreder.uk@gmail.com>

	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
*/ 

JUCI.app
.directive("juciLogin", function(){
	return {
		// accepted parameters for this tag
		scope: {
		}, 
		templateUrl: "/widgets/juci-login.html", 
		replace: true, 
		controller: "juciLogin",
		controllerAs: "ctrl"
	}; 
})
.controller("juciLogin", function($scope, $config, $state, 
	$window, $rpc, $localStorage, gettext){
	$scope.form = { 
		"username": "", 
		"password": "", 
		"remember": 0, 
		"host": localStorage.getItem("rpc_url") || ""
	}; 
	$scope.showlogin = true; 
	$scope.showHost = true; 

	if($config.settings.login){
		$scope.form.username = ($config.settings && $config.settings.login)? $config.settings.login.defaultuser.value: "admin";
		$scope.showlogin = ($config.settings && $config.settings.login)? $config.settings.login.showusername.value:true;
		$scope.showHost = $config.settings.login.showhost.value;
	} 

	$scope.connecting = true; 
	
	$scope.errors = []; 

	JUCI.interval.repeat("login-connection-check", 5000, function(done){
		// TODO: this connection logic is bad. Must refactor this into something that is more stable. 
		// Must be done without forcing user to reload the page!
		$scope.is_connected = $rpc.$isConnected(); 
		$scope.connecting = $rpc.conn_promise && !$scope.is_connected; 
		setTimeout(function(){ $scope.$apply(); }, 0); 
		done(); 
	}); 
	
	$scope.doLogin = function(redirect){
		var deferred = $.Deferred(); 
		if(!redirect) redirect = "overview"; 
		$scope.errors = []; 
		$scope.logging_in = true; 
		async.series([
			function(next){
				$rpc.$connect($scope.form.host).done(function(){
					next(); 
				}).fail(function(){
					$scope.errors.push(gettext("Could not connect to "+$scope.form.host+"!"));
					$scope.logging_in = false; 
					$scope.$apply(); 
					deferred.reject(); 
				}); 
			}, 
			function(next){
				$rpc.$login($scope.form.username,$scope.form.password).done(function success(res){
					//window.location.reload(); 
					//window.location.href=redirect; 
					next(); 
				}).fail(function fail(res){
					//$scope.errors.push(res); 
					console.error("Could not log in!"); 
					$scope.errors.push(gettext("Please enter correct username and password!"));
					$scope.logging_in = false; 
					$scope.$apply(); 
					deferred.reject(); 
				}); 
			}, 
			function(next){
				JUCI.$init().done(function(){
					$state.go(redirect); 
					deferred.resolve(); 
				}); 
			}
		]); 
		return deferred.promise(); 
	}
	$scope.doLogout = function(){
		var deferred = $.Deferred(); 
		$rpc.$logout().done(function(){
			console.log("Logged out!"); 
			JUCI.redirectHome(); 
			window.location.reload(); 
			deferred.resolve(); 
		}).fail(function(){
			console.error("Error logging out!");
			deferred.reject(); 
		});  
		return deferred.promise(); 
	}
	
}); 
		
