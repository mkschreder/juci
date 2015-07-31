//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
/*
 * juci - javascript universal client interface
 *
 * Project Author: Martin K. Schröder <mkschreder.uk@gmail.com>
 * 
 * Copyright (C) 2012-2013 Inteno Broadband Technology AB. All rights reserved.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA
 */
 
$juci.module("phone")
.controller("PhoneNumberBlockingPageCtrl", function($scope, $uci){
	function updateRuleLists(){
		$scope.outgoingRules = $uci.voice_client["@call_filter_rule_outgoing"].filter(function(x){
			return x.owner.value == "call_filter0"; 
		}); 
		$scope.incomingRules = $uci.voice_client["@call_filter_rule_incoming"].filter(function(x){
			return x.owner.value == "call_filter0"; 
		}); 
		setTimeout(function(){ $scope.$apply(); }, 0); 
	}
	
	$uci.sync("voice_client").done(function(){
		if(!$uci.voice_client.call_filter0){
			async.series([
				function(next){
					$uci.voice_client.create({".type": "call_filter", ".name": "call_filter0"}).always(function(){ next(); }); 
				}, 
				function(next){
					$uci.voice_client.create({".type": "call_filter_rule_incoming", ".name": "call_filter_rule_incoming0"}).always(function(){ next(); }); 
				},
				function(next){
					$uci.voice_client.create({".type": "call_filter_rule_outgoing", ".name": "call_filter_rule_outgoing0"}).always(function(){ next(); }); 
				},
				function(next){
					$uci.voice_client.create({".type": "call_filter_rule_outgoing", ".name": "call_filter_rule_outgoing1"}).always(function(){ next(); }); 
				},
				function(next){
					$uci.save().always(function(){ next(); }); 
				}
			]); 
		}
		$scope.filter = $uci.voice_client.call_filter0; 
		updateRuleLists(); 
	}); 
	
	$scope.onAddOutgoingRule = function(){
		$uci.voice_client.create({".type": "call_filter_rule_outgoing", "owner": "call_filter0"}).always(function(){ 
			updateRuleLists(); 
		}); 
	}
	$scope.onAddIncomingRule = function(){
		$uci.voice_client.create({".type": "call_filter_rule_incoming", "owner": "call_filter0"}).always(function(){ 
			updateRuleLists(); 
		}); 
	}
	$scope.onDeleteOutgoingRule = function(rule){
		rule.$delete().done(function(){
			updateRuleLists(); 
		}); 
	}
	$scope.onDeleteIncomingRule = function(rule){
		rule.$delete().done(function(){
			updateRuleLists(); 
		});
	}
	/*
	$scope.onSave = function(){
		$uci.save(); 
	}
	*/
}); 
