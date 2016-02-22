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
.directive("juciConfig", function(){
	return {
		template: '<div ng-transclude></div>', 
		replace: true, 
		transclude: true
	};  
})
.directive("juciConfigSection", function(){
	return {
		template: '<div><div class="juci-config-section" ng-transclude></div><hr style="width: 100%; border-bottom: 1px solid #ccc; clear: both;"/></div>', 
		replace: true, 
		transclude: true
	 };  
})
.directive("juciConfigInfo", function(){
	return {
		template: '<div class="juci-config-info" ng-transclude></div>', 
		replace: true, 
		transclude: true
	 };  
})
.directive("juciConfigHeading", function(){
	return {
		template: '<h2 ng-transclude></h2>', 
		replace: true, 
		transclude: true
	 };  
})
.directive("juciConfigLines", function(){
	return {
		template: '<div class="table" ><div ng-transclude></div></div>', 
		replace: true, 
		transclude: true
	 };  
})
.directive("juciConfigLine", function(){
	return {
		template: '<div><div class="row juci-config-line" style="margin-top: 20px; ">'+
			'<div class="col-md-6 {{errorClass}}">'+
				'<label style="font-size: 1.2em">{{title}}</label>'+
				'<p style="font-size: 12px">{{help}}</p>'+
			'</div>'+
			'<div class="col-md-6 col-xs-pull-0 juci-config-line-data">'+
				'<div class="{{pullClass}}" ng-transclude></div>'+
			'</div></div>'+
			'<div class="alert alert-danger" style="font-size: 0.8em" ng-show="error">{{error}}</div>'+
			'</div>', 
		replace: true, 
		scope: {
			title: "@", 
			help: "@", 
			error: "="
		}, 
		transclude: true, 
		link: function (scope, element, attrs) {
			if(!("noPull" in attrs)) scope.pullClass = "pull-right";
			scope.$watch("error", function configError(value){
				if(value){
					scope.errorClass = "field-error"; 
				} else {
					scope.errorClass = ""; 
				}
			}); 
		}
	};  
})
.directive("juciConfigApply", function(){
	return {
		template: '<div>'+
			'<div class="alert alert-danger" ng-show="errors && errors.length"><ul><li ng-repeat="e in errors track by $index">{{e|translate}}</li></ul></div>'+
			'<div class="alert alert-success" ng-show="!errors.length && success">{{success}}</div>'+
			'<div class="btn-toolbar" >'+
			'<button class="btn btn-lg btn-default" ng-show="changes && changes.length" ng-click="showChanges()">{{"Pending Changes" | translate}} <span class="badge">{{numUnsavedChanges()}}</span></button>'+
			'<span ng-hide="changes && changes.length">{{"No unsaved changes" | translate}}</span>'+
			'<button class="btn btn-lg btn-default col-lg-2 pull-right" ng-click="onCancel()" ng-disabled="changes && !changes.length" title="{{\'Discard all changes and reload\'|translate}}">{{ "Cancel" | translate }}</button>'+
			'<button class="btn btn-lg btn-primary col-lg-2 pull-right" ng-click="onApply()" title="{{\'Write settings to the router\'|translate}}" ng-disabled="busy"><i class="fa fa-spinner" ng-show="busy"/>{{ "Apply"| translate }}</button>'+
			'</div><div style="clear: both;"></div></div>', 
		replace: true, 
		scope: {
			onPreApply: "&"
		}, 
		controller: "juciConfigApplyController"
	 }; 
}).controller("juciConfigApplyController", function($scope, $uci, $rootScope, $tr, gettext, $juciDialog){
	$scope.changes = []; 
	$scope.numUnsavedChanges = function(){
		return $scope.changes.length;
	}; 

	// only do this once per second and not on each digest!
	JUCI.interval.repeat("changes-monitor", 1000, function(done){
		$scope.changes = $uci.$getChanges();
		setTimeout(function(){ $scope.$apply(); }, 0); 
		done(); 
	}); 

	$scope.showChanges = function(){
		var model = {changes: $scope.changes};
		$juciDialog.show("juci-changes-edit", {
			title: gettext("Unsaved Changes"),
			buttons: [{label: gettext("OK"), value: "apply"}],
			on_apply: function(btn, inst){
				if(!model.reverted) return true;
				model.reverted.map(function(x){
					if(!$uci[x.config] || !$uci[x.config][x.section] || !$uci[x.config][x.section][x.option] || !$uci[x.config][x.section][x.option].$reset) return;
					$uci[x.config][x.section][x.option].$reset();
				});
				return true;
			},
			model: model
		});
	};
	$scope.onApply = function(){
		$scope.$emit("errors_begin"); 
		//if($scope.onPreApply) $scope.onPreApply(); 
		$scope.busy = 1; 
		$scope.success = null; 
		$scope.errors = []; 
		try {
			$uci.$save().done(function(){
				$scope.numUnsavedChanges(); 
				console.log("Saved uci configuration!"); 
			}).fail(function(errors){
				$scope.errors = errors; 
				$scope.$emit("errors", errors); 
				console.error("Could not save uci configuration!"); 
			}).always(function(){
				$scope.busy = 0; 
				// I'm removing the success reporting for now because the pane automatically hides when all changes have been applied.  
				//$scope.success = gettext("Settings have been applied successfully!"); 
				$scope.$apply(); 
				/*setTimeout(function(){
					$scope.success = null; 
				}, 1000); */
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
		if(confirm($tr(gettext("Are you sure you want to reload settings from the router? All your current changes will be lost!")))){
			window.location.reload(); 
		}
	}
}).directive("juciConfigApplyPane", function(){
	return {
		template: '<div ng-hide="hide" class="juci-config-apply-pane">'+
		//'<button class="btn btn-sm btn-default pull-right" ng-click="onHide()"><i class="fa fa-times-circle"></i></button>'+
		'<div class="container">'+
			'<juci-config-apply></juci-config-apply>'+
		'</div></div>',
		scope: {}, 
		replace: true,
		controller: "juciConfigApplyPane"
	}; 
}).controller("juciConfigApplyPane", function($scope, $events, $rootScope, $uci){
	$scope.changes = $uci.$getChanges(); 
	$scope.hide = true; 
	
	// TODO: reloading takes a lot of computing (have to go through all fields)
	// and this reload may happen several times in a row. 
	// perhaps do not run it every time? 
	var prev_time = (new Date()).getTime(); 
	$rootScope.$watch(function onWatchJuciConfigApplyChanges(){
		var now = (new Date()).getTime(); 
		if(now < (prev_time + 500)) return; 
		prev_time = now; 

		var changes = $uci.$getChanges(); 
		if(changes.length > 0) {
			if($scope.hide == true) { 
				// reset the message when showing the pane again
				$scope.success = null; 
			}
			$scope.hide = false; 
		} else {
			$scope.hide = true; 
		}
		return true; // have to return true to avoid infinite digest!
	});  
}); 

