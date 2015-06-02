//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("luciFooter", function(){
	var plugin_root = $juci.module("core").plugin_root; 
	
	return {
		templateUrl: plugin_root+"/widgets/luci.footer.html", 
		controller: "luciFooter"
	}; 
})
.controller("luciFooter", function($scope, $rpc, $languages, gettextCatalog, gettext, $tr, $config){
	// TODO: move this into a higher level controller maybe? 
	$scope.languages = $languages.getLanguages(); 
	$scope.isActiveLanguage = function(lang){
		return gettextCatalog.currentLanguage == lang.short_code; 
	}
	$scope.setLanguage = function(lang){
		$languages.setLanguage(lang.short_code); 
	}; 
	$scope.wanip = $tr(gettext("Not connected")); 
	
	$scope.$init = function(){
		var deferred = $.Deferred(); 
		async.series([
			function(next){
				$rpc.network.interface.dump().done(function(result){
					if(result && result.interface) {
						result.interface.map(function(i){
							if(i.interface == $config.wan_interface && i["ipv4-address"] && i["ipv4-address"].length){
								$scope.wanip = i["ipv4-address"][0].address; 
							}
						}); 
					}
				}).always(function(){ next(); }); 
			},
			function(next){
				$rpc.router.info().done(function(result){
					if(result.system) $scope.firmware = result.system.firmware; 
				}).always(function(){ next(); }); 
			}
		], function(){
			$scope.$apply(); 
			deferred.resolve(); 
		}); 
		return deferred.promise(); 
	}
	$scope.$init(); 
}); 
