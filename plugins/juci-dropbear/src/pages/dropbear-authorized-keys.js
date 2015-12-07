//! Author: Stefan Nygren <stefan.nygren@hiq.se>

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

