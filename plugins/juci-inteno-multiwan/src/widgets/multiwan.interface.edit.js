//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.directive("multiwanInterfaceEdit", function($compile, $parse){
	return {
		templateUrl: "/widgets/multiwan.interface.edit.html", 
		scope: {
			interface: "=ngModel"
		}, 
		controller: "multiwanInterfaceEdit", 
		replace: true, 
		require: "^ngModel"
	 };  
})
.controller("multiwanInterfaceEdit", function($scope, $uci, $network, $rpc, $tr, gettext){
	
}); 
