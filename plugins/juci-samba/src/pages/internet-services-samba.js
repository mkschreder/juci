//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("ServiceSambaPage", function($scope, $tr, gettext, $uci, $samba, gettext){
	$samba.getConfig().done(function(config){
		$scope.config = config; 
		$scope.$apply(); 
	});  

	$samba.getShares().done(function(shares){
		$scope.shares = shares; 
		$scope.$apply(); 
	});

	$samba.getUsers().done(function(users){
		$scope.users = users; 
		$scope.$apply(); 
	});

	$scope.getSambaShareTitle = function(share){
		return share.name.value; 
	}

	$scope.onCreateShare = function(){
		$uci.samba.$create({
			".type": "sambashare",
			"name": $tr(gettext("New samba share"))
		}).done(function(){
			$scope.$apply(); 
		}); 
	}

	$scope.onDeleteShare = function($item){
		$item.$delete().done(function(){
			$scope.$apply(); 
		}); 
	}

	$scope.onCreateUser = function(){
		$uci.samba.$create({
			".type": "sambausers",
			"user": "guest"
		}).done(function(){
			$scope.$apply(); 
		}); 
	}

	$scope.onDeleteUser = function($item){
		$item.$delete().done(function(){
			$scope.$apply(); 
		}); 
	}

}); 
