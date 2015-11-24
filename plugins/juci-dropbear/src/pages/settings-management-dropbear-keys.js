//! Author: Stefan Nygren <stefan.nygren@hiq.se>

JUCI.app.controller("dropbear_key_management", function($scope, $rpc, $uci){
    $rpc.juci.dropbear.get_public_keys().done(function(keys){
		$scope.keyList = keys;
        $scope.$apply();
	
    });

	$scope.getItemTitle = function(item){
        return item.id;
    }
	
	$scope.onAddKey = function(){
            $scope.$apply();
        }
    
	$scope.onDeleteKey = function(item){
		   $rpc.juci.dropbear.remove_public_key(item).done(function(res){
				$scope.stc= res.status;
				$scope.$apply();
			});
        }
    


});

