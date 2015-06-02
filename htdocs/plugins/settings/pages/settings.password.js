//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("SettingsPasswordCtrl", function($scope, $rpc, $tr, gettext){
	$scope.showPassword = 0; 
	$scope.showModal = 0; 
	$scope.username = $rpc.$session.data.username; 
	$scope.modal = {
		old_password: "", 
		password: "", 
		password2: ""
	}; 
	$scope.passwordStrength = 1; 
	
	
	function measureStrength(p) {
		var strongRegex = new RegExp("^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$", "g");
		var mediumRegex = new RegExp("^(?=.{7,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$", "g");
		var enoughRegex = new RegExp("(?=.{4,}).*", "g");
		 
		if(strongRegex.test(p)) return 3; 
		if(mediumRegex.test(p)) return 2; 
		if(enoughRegex.test(p)) return 1; 
		return 0; 
	}
	
	$scope.$watch("modal", function(){
		$scope.passwordStrength = measureStrength($scope.modal.password); 
	}, true); 
	$scope.onChangePasswordClick = function(){
		$scope.modal = {}; 
		$scope.showModal = 1; 
	}
	$scope.onAcceptModal = function(){
		$scope.error = ""; 
		if($scope.modal.password != $scope.modal.password2) alert($tr(gettext("Passwords do not match!"))); 
		else {
			// TODO: change to correct username
			$rpc.luci2.system.password_set({user: $rpc.$session.data.username, password: $scope.modal.password, curpass: $scope.modal.old_password}).done(function(data){
				$scope.showModal = 0; 
				$scope.$apply(); 
				$rpc.$logout().done(function(){
					window.location.reload(); 
				}); 
			}).fail(function(response){
				$scope.error = gettext("Was unable to set password. Please make sure you have entered correct current password!"); 
				$scope.$apply(); 
			}); 
		}
	}
	$scope.onDismissModal = function(){
		$scope.showModal = 0; 
	}
}); 

