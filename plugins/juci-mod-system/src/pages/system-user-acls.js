//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
//! Copyright (c) 2015

UCI.$registerConfig("rpcd");
UCI.rpcd.$registerSectionType("login", {
	"username": 	{ dvalue: "", type: String }, 
	"password": 	{ dvalue: "", type: String }, 
	"read": 		{ dvalue: [], type: Array }, 
	"write": 		{ dvalue: [], type: Array }
}); 

JUCI.app
.controller("systemUserAclsPage", function($scope, $rpc, $uci, $tr, gettext){
	$uci.$sync("rpcd").done(function(){
		$scope.users = $uci.rpcd["@login"];
		$scope.$apply(); 
	}); 
}); 
