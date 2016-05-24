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

JUCI.app
.controller("InternetFirewallRulesPage", function($scope, $uci, $firewall, $tr, gettext){
	$firewall.getRules().done(function(rules){
		$scope.rules = rules; 
		$scope.$apply(); 
	}); 
	$uci.$sync("firewall").done(function(){
		$scope.firewall = $uci.firewall; 
		$scope.$apply(); 
	});  
	$scope.getItemTitle = function(item){
		return item.name.value || item[".name"]; 
	}
	
	
	$scope.onCreateRule = function(){
		$uci.firewall.$create({
			".type": "rule", 
			"name": "new_rule"
		}).done(function(){
			$scope.$apply(); 
		}); 
	}
	
	$scope.onDeleteRule = function(rule){
		if(!rule) alert($tr(gettext("Please select a rule to delete!")));
		if(confirm($tr(gettext("Are you sure you want to delete this rule?")))){
			rule.$delete().done(function(){
				$scope.$apply(); 
			}); 
		}
	}
	
}); 
