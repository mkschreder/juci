//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("sambaShareEdit", function($compile){
	return {
		scope: {
			share: "=ngModel"
		}, 
		templateUrl: "/widgets/samba-share-edit.html", 
		controller: "sambaShareEdit", 
		replace: true
	 };  
})
.controller("sambaShareEdit", function($scope, $network, $modal){
	$scope.data = {}; 
	$scope.$watch("share", function(value){
		if(!value) return; 
		$scope.data.guest_ok = (value.guest_ok.value == "yes")?true:false; 
		$scope.data.read_only = (value.read_only.value == "yes")?true:false; 
	}); 
	$scope.$watch("data.guest_ok", function(value){
		if(!$scope.share) return; 
		$scope.share.guest_ok.value = (value)?"yes":"no"; 
	}); 
	$scope.$watch("data.read_only", function(value){
		if(!$scope.share) return; 
		$scope.share.read_only.value = (value)?"yes":"no"; 
	}); 
}); 
