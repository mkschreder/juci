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
.controller("InternetParentalControlPage", function($scope, $uci, $rpc, $network, $tr, gettext){
	$scope.urlList = [];
	$scope.macList = []; 
	$scope.errors = []; 
	$scope.connectedHosts = []; 
	
	$network.getConnectedClients().done(function(clients){
		$scope.connectedHosts = clients.map(function(client){
			return { 
				label: (client.hostname||"*")+" ("+client.ipaddr+")", 
				value: client.macaddr 
			}; 
		}); 
		$scope.$apply(); 
	});
	
	async.series([
		function(next){
			$uci.$sync("firewall").done(function(){
				$scope.firewall = $uci.firewall; 
				if(!$uci.firewall.urlblock){
					$uci.firewall.create({".type": "urlblock", ".name": "urlblock"}).done(function(){
						$uci.save().always(function(){ next(); }); 
					}); 
				} else {
					next(); 
				}
			}); 
		}, function(next){
			// create url blocking section if it does not exist
			if(!$uci.firewall.urlblock){
				$uci.firewall.$create({
					".type": "urlblock", 
					".name": "urlblock"
				}).always(function(){
					next(); 
				}); 
			} else {
				next(); 
			}
		}, function(){
			$scope.accessRules = $uci.firewall["@rule"].filter(function(x){
				return x.parental.value; 
			}); 
			$scope.urlblock = $uci.firewall.urlblock; 
			$scope.urlblock.url.value.map(function(x){ $scope.urlList.push({url: x}); }); 
			$scope.urlblock.src_mac.value.map(function(x){ $scope.macList.push({mac: x}); }); 
			
			$scope.validateMAC = function(mac) { return (new UCI.validators.MACAddressValidator()).validate({value: mac}); }
			$scope.validateTimeSpan = function(range) { return (new UCI.validators.TimespanValidator()).validate({value: range})}; 
			
			$scope.onAddURL = function(){
				$scope.urlList.push({url: ""}); 
			}
			$scope.onDeleteURL = function(url){
				$scope.urlList = $scope.urlList.filter(function(x){
					return x.url != url; 
				}); 
			}
			
			$scope.$watch("urlList", function(){
				$scope.urlblock.url.value = $scope.urlList.map(function(k){
					return k.url; 
				}); 
			}, true);
			$scope.$watch("macList", function(){
				$scope.urlblock.src_mac.value = $scope.macList.map(function(k){
					return k.mac; 
				}); 
			}, true);
			
			function updateRules(){
				$scope.accessRules = $uci.firewall["@rule"].filter(function(rule){
					return rule.parental.value; 
				}); 
			} updateRules(); 
			
			$scope.onAddAccessRule = function(){
				$uci.firewall.create({
					".type": "rule", 
					"parental": true
				}).done(function(rule){
					rule[".new"] = true; 
					rule.name.value = $tr(gettext("Parental Rule")); 
					$scope.rule = {
						time_start: rule.start_time.value, 
						time_end: rule.stop_time.value, 
						days: rule.weekdays.value.split(" "), 
						macList: rule.src_mac.value.map(function(x){ return { mac: x }; }), 
						uci_rule: rule
					}; 
					$scope.$apply(); 
				}); 
			}
			
			$scope.onEditAccessRule = function(rule){
				$scope.rule = {
					time_start: rule.start_time.value, 
					time_end: rule.stop_time.value, 
					days: rule.weekdays.value.split(" "), 
					macList: rule.src_mac.value.map(function(x){ return { mac: x }; }), 
					uci_rule: rule
				}; 
			}
			
			$scope.onDeleteAccessRule = function(rule){
				rule.$delete().done(function(){
					updateRules(); 
					$scope.$apply(); 
				}); 
			}
			
			$scope.onAcceptEdit = function(){
				if($scope.rule.macList.find(function(k){
					return $scope.validateMAC(k.mac); 
				})) return; 
				
				var rule = $scope.rule.uci_rule; 
				if(rule[".new"]) {
					$scope.accessRules.push(rule); 
					rule[".new"] = false; 
				}
				rule.src_mac.value = $scope.rule.macList.map(function(k){
					return k.mac; 
				}); 
				rule.start_time.value = $scope.rule.time_start; 
				rule.stop_time.value = $scope.rule.time_end; 
				rule.weekdays.value = $scope.rule.days.join(" "); 
				
				$scope.errors = rule.$getErrors().concat($scope.validateTimeSpan($scope.rule.time_start+"-"+$scope.rule.time_end)).filter(function(x){ return x; }); 
				if(!$scope.errors || $scope.errors.length == 0)
					$scope.rule = null; 
			}
			
			$scope.onCancelEdit = function(){
				if($scope.rule && $scope.rule.uci_rule){
					if($scope.rule.uci_rule[".new"])
						$scope.rule.uci_rule.$delete(); 
					else 
						$scope.rule.uci_rule.$reset(); 
				}
				$scope.rule = null; 
			}
			
			$scope.$apply(); 
		}
	]); 
}); 
