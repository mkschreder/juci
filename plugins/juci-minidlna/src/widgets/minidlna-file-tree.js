/*	
	This file is part of JUCI (https://github.com/mkschreder/juci.git)

	Copyright (c) 2015 Reidar Cederqvist <reidar.cederqvist@gmail.com>

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
.directive("minidlnaFileTree", function(){
	return {
		templateUrl: "/widgets/minidlna-file-tree.html",
		scope: {
			model: "=ngModel"	
		},
		require: "^ngModel",
		controller: "minidlnaFileTreeController"
	};
}).controller("minidlnaFileTreeController", function($scope, $rpc, $tr, gettext){
	$scope.data = {
			tree: [{
			label: $tr(gettext("Loading.."))
		}], 
		dirtypes: [ 
			{ label: $tr(gettext("All types")), value:"" }, 
			{ label: $tr(gettext("Video only")), value:"V" },
			{ label: $tr(gettext("Audio only")), value:"A" },
			{ label: $tr(gettext("Pictures only")), value:"P" }
		]
	}; 
	$scope.model.selected_dirtype = $scope.data.dirtypes[0].value;
	$scope.on_select = function(branch){
		$scope.model.selected = branch; 
	}
	$rpc.juci.minidlna.folder_tree().done(function(data){
		function to_tree_format(obj){
			return Object.keys(obj).map(function(folder){
				if(obj[folder]["children"]){
					var tmp = {
						label: "/"+folder+"/",
						path: obj[folder]["path"]
					}
					if(typeof obj[folder]["children"] == "object"){
						tmp.children = to_tree_format(obj[folder]["children"]);
					}
					return tmp;
				}
			});
		}
		$scope.data.tree = to_tree_format(data); 
		$scope.model.selected = {};
		$scope.$apply();
	});
});
