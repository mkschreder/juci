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
.controller("sambaShareEdit", function($scope, $network, $modal, $juciDialog, $tr, gettext, $uci){
	$scope.data = {}; 
	$scope.users = {
		all: [],
		out: []
	};

	$scope.$watch("share", function onSambaShareModelChanged(value){
		if(!value) return; 
		$scope.data.model = (value.path.value.length > 3) ? value.path.value.slice(4): "";
		$uci.$sync("samba").done(function(){
			var users = $uci.samba["@sambausers"];
			var selected = value.users.value.split(",").filter(function(u){
				return users.find(function(user){ return user.user.value == u; }) != null;
			});
			$scope.users.all = users.map(function(user){
				var sel = selected.find(function(sel){ return user.user.value == sel; });
				return {label: user.user.value + ((user.desc.value == "") ? "" : " (" + user.desc.value + ")"), value: user.user.value, selected: (sel)? true : false};
			});
			$scope.$apply();
		});
	}); 
	$scope.reloadUsers = function(){
		if(!$scope.share) return;
		$uci.$sync("samba").done(function(){
			var users = $uci.samba["@sambausers"];
			var selected = $scope.share.users.value.split(",").filter(function(u){
				return users.find(function(user){ return user.user.value == u; }) != null;
			});
			$scope.users.all = users.map(function(user){
				var sel = selected.find(function(sel){ return user.user.value == sel; });
				return {label: user.user.value + ((user.desc.value == "") ? "" : " (" + user.desc.value + ")"), value: user.user.value, selected: (sel)? true : false};
			});
			$scope.$apply();
		});
	};

	$scope.$watch("users.out", function onSambaUsersOutChanged(){
		if(!$scope.users || !$scope.users.out || !$scope.share) return;
		$scope.share.users.value = $scope.users.out.map(function(user){ return user.value; }).join(",");
	}, false);
	$scope.$watch("data.model", function onSambaUsersDataModelChanged(value){
		if(!$scope.share) return;
		$scope.share.path.value = "/mnt" + value;
	}, false);

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
