/*	
	This file is part of JUCI (https://github.com/mkschreder/juci.git)

	Copyright (c) 2015 Stefan Nygren <stefan.nygren@hiq.se>

	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
*/ 

JUCI.app.controller("dropbearAuthorizedKeysPage", function($scope, $rpc, $uci, $tr, gettext, dropbearAddKey){
	function refresh(){
		$rpc.juci.dropbear.get_public_keys().done(function(keys){
			$scope.keyList = keys;
			$scope.$apply();
		}).fail(function(){
			$scope.keyList = [];
		}); 
	}
	refresh(); 

	$scope.onDeleteKey = function(item){
	   $rpc.juci.dropbear.remove_public_key(item).done(function(res){
	  		if(res.error) alert($tr(res.error)); 	
			refresh();
		});
	}

	$scope.onAddKey = function(){
		dropbearAddKey.show().done(function(data){
			$rpc.juci.dropbear.add_public_key(data).done(function(result){
				if(result.error) alert($tr(result.error)); 
				refresh();
			});
		});
	}

	$scope.getItemTitle = function(item){
		if(!item.id || item.id == "") return $tr(gettext("Key ending with"))+" "+item.key.substr(-4); 
		return item.id; 
	}

});

