//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("juciFooter", function(){
	return {
		templateUrl: "/widgets/juci-footer.html", 
		controller: "juciFooter"
	}; 
})
.controller("juciFooter", function($scope, $rpc, $network, $languages, gettextCatalog, gettext, $tr, $config){
	// TODO: move this into a higher level controller maybe? 
	$scope.languages = $languages.getLanguages(); 
	$scope.isActiveLanguage = function(lang){
		return gettextCatalog.currentLanguage == lang.short_code; 
	}
	$scope.setLanguage = function(lang){
		$languages.setLanguage(lang.short_code); 
	}; 
	$scope.wanifs = []; 

	$scope.onLogout = function(){
		console.log("logging out");
		$rpc.$logout().always(function(){
			window.location.href="/";
		});
	}

	$scope.$init = function(){
		var deferred = $.Deferred(); 
		async.series([
			function(next){
				$network.getDefaultRouteNetworks().done(function(result){
					$scope.wanifs = result.map(function(x){ return x.$info; }); 
					$scope.$apply(); 
				}); 
			}
		], function(){
			$scope.firmware = $config.board.release.distribution + " " + $config.board.release.version + " " + $config.board.release.revision; 
			$scope.$apply(); 
			deferred.resolve(); 
		}); 
		return deferred.promise(); 
	}
	$scope.$init(); 
}); 
