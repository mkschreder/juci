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

JUCI.app.requires.push("ui.bootstrap.typeahead"); 
JUCI.app.requires.push("ngAnimate"); 

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
.controller("sambaShareEdit", function($scope, $network, $modal, $juciDialog, $tr, gettext){
	$scope.data = {}; 

	$scope.$watch("share", function(value){
		if(!value) return; 
		$scope.data.guest_ok = (value.guest_ok.value == "yes")?true:false; 
		$scope.data.read_only = (value.read_only.value == "yes")?true:false; 
		$scope.data.model = (value.path.value.length > 3) ? value.path.value.slice(4): "";
	}); 
	$scope.$watch("data.model", function(value){
		if(!$scope.share) return;
		$scope.share.path.value = "/mnt" + value;
	}, false);
	$scope.$watch("data.guest_ok", function(value){
		if(!$scope.share) return; 
		$scope.share.guest_ok.value = (value)?"yes":"no"; 
	}); 
	$scope.$watch("data.read_only", function(value){
		if(!$scope.share) return; 
		$scope.share.read_only.value = (value)?"yes":"no"; 
	}); 

	var def = null
	$scope.onAutocomplete = function(query){
		if(!def){
			var def = $.Deferred(); 
			$scope.loadingLocations = true;
			$rpc.juci.samba.autocomplete({ path: query.slice(1) }).done(function(result){
				def.resolve(result.folders); 
			}).fail(function(){
				def.reject(); 
			}).always(function(){def = null; $scope.loadingLocations = false;});
		}
		return def.promise(); 
	}
	$scope.onAddFolder = function(){
		var model = {}
		$juciDialog.show("samba-file-tree", {
			title: $tr(gettext("Add folder to share")),
			model: model,
			on_apply: function(btn, dlg){
				if(!model.path)return true;
					$scope.data.model = model.path;
				return true;
			}	
		});
	};

}); 
