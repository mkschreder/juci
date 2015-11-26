//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
//! Copyright 2015 (c) Martin K. Schröder

JUCI.app
.directive("systemUserEdit", function(){
	return {
		templateUrl: "/widgets/system-user-edit.html", 
		scope: {
			ngModel: "=ngModel"
		}, 
		controller: "systemUserEdit", 
		replace: true
	 };  
})
.controller("systemUserEdit", function($scope, $rpc, $uci, $tr, gettext){
	var acls = $rpc.$session.acls["access-group"]; 
	var readAcls = Object.keys(acls).filter(function(x){
		return acls[x].indexOf("read") != -1; 
	}); 
	var writeAcls = Object.keys(acls).filter(function(x){
		return acls[x].indexOf("write") != 1; 
	}); 
	$scope.$watch("ngModel", function(value){
		if(!value) return; 
		$scope.readPerm = []; 
		$scope.ngModel.read.value.forEach(function(x){
			if(x == "*"){
				$scope.readPerm = $scope.readPerm.concat(readAcls); 
			} else {
				$scope.readPerm.push(x); 
			}
		}); 
		$scope.writePerm = []; 
		$scope.ngModel.write.value.forEach(function(x){
			if(x == "*"){
				$scope.writePerm = $scope.writePerm.concat(writeAcls); 
			} else {
				$scope.writePerm.push(x); 
			}
		}); 
	}); 
}); 
