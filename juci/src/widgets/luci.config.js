$juci.module("core")
.directive("luciConfig", function(){
	var plugin_root = $juci.module("core").plugin_root; 
	return {
		template: '<div ng-transclude></div>', 
		replace: true, 
		transclude: true
	};  
})
.directive("luciConfigSection", function(){
	var plugin_root = $juci.module("core").plugin_root; 
	return {
		template: '<div><div class="luci-config-section" ng-transclude></div><hr style="width: 100%; border-bottom: 1px solid #ccc; clear: both;"/></div>', 
		replace: true, 
		transclude: true
	 };  
})
.directive("luciConfigInfo", function(){
	var plugin_root = $juci.module("core").plugin_root; 
	return {
		template: '<p class="luci-config-info" ng-transclude></p>', 
		replace: true, 
		transclude: true
	 };  
})
.directive("luciConfigHeading", function(){
	var plugin_root = $juci.module("core").plugin_root; 
	return {
		template: '<h2 ng-transclude></h2>', 
		replace: true, 
		transclude: true
	 };  
})
.directive("luciConfigLines", function(){
	var plugin_root = $juci.module("core").plugin_root; 
	return {
		template: '<div class="table" ><div ng-transclude></div></div>', 
		replace: true, 
		transclude: true
	 };  
})
.directive("luciConfigLine", function(){
	var plugin_root = $juci.module("core").plugin_root; 
	return {
		template: '<div><div class="row" style="margin-top: 20px; ">'+
			'<div class="{{labelClass}}">'+
				'<label style="{{labelStyle}}">{{title}}</label>'+
				'<p style="font-size: 12px">{{help}}</p>'+
			'</div>'+
			'<div class="col-xs-6">'+
				'<div class="{{pullClass}}" ng-transclude></div>'+
			'</div></div></div>', 
		replace: true, 
		scope: {
			title: "@", 
			help: "@"
		}, 
		transclude: true, 
		link: function (scope, element, attrs) {
			if(!("noPull" in attrs)) scope.pullClass = "pull-right";
            if(!("indent" in attrs)) {
                scope.labelClass = "col-xs-6";
                scope.labelStyle = "font-size:1.2em";
            } else {
                scope.labelClass = "col-xs-5 col-xs-offset-1";
                scope.labelStyle = "font-size:1em;transform:translateY(30%);";
            }
        }
	 };  
})
.directive("luciConfigApply", function(){
	var plugin_root = $juci.module("core").plugin_root; 
	return {
		template: '<div><div class="btn-toolbar" >'+
			'<button class="btn btn-lg btn-default col-lg-2 pull-right" ng-click="onCancel()">{{ "Cancel" | translate }}</button>'+
			'<button class="btn btn-lg btn-primary col-lg-2 pull-right" ng-click="onApply()" ng-disabled="busy"><i class="fa fa-spinner" ng-show="busy"/>{{ "Apply"| translate }}</button>'+
			'</div><div style="clear: both;"></div></div>', 
		replace: true, 
		scope: {
			onPreApply: "&"
		}, 
		controller: "luciConfigApplyController"
	 }; 
}).controller("luciConfigApplyController", function($scope, $uci){
	$scope.onApply = function(){
		if($scope.onPreApply) $scope.onPreApply(); 
		$scope.busy = 1; 
		try {
			$uci.save().done(function(){
				console.log("Saved uci configuration!"); 
			}).fail(function(){
				console.error("Could not save uci configuration!"); 
			}).always(function(){
				$scope.busy = 0; 
				setTimeout(function(){$scope.$apply();}, 0); 
			}); 
		} catch(e){
			$scope.busy = 0; 
			setTimeout(function(){$scope.$apply();}, 0); 
			$scope.$emit("error", e.message); 
			console.error("Error while applying config: "+e.message); 
		}
	}
	$scope.onCancel = function(){
		// simple way to reset
		window.location.reload(); 
	}
}); 

