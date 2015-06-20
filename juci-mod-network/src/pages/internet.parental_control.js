JUCI.app
.controller("InternetParentalControlPage", function($scope, $uci, $rpc, $network){
	$scope.urlList = [];
	$scope.macList = []; 
	$scope.connectedHosts = []; 
	
	$network.getConnectedClients().done(function(clients){
		$scope.connectedHosts = clients.map(function(k){
			return { label: clients[k].hostname+" ("+clients[k].ipaddr+")", value: clients[k].macaddr }; 
		}); 
		$scope.$apply(); 
	});
	
	async.series([
		function(next){
			$uci.sync("firewall").done(function(){
				$scope.firewall = $uci.firewall; 
				if(!$uci.firewall.urlblock){
					$uci.firewall.create({".type": "urlblock", ".name": "urlblock"}).done(function(){
						$uci.save().always(function(){ next(); }); 
					}); 
				} else {
					next(); 
				}
			}); 
		}, function(){
			$scope.urlblock = $uci.firewall.urlblock; 
			$scope.accessRules = $uci.firewall["@rule"].filter(function(x){
				return x.parental.value; 
			}); 
			$scope.urlblock.url.value.map(function(x){ $scope.urlList.push({url: x}); }); 
			$scope.urlblock.src_mac.value.map(function(x){ $scope.macList.push({mac: x}); }); 
			
			$scope.validateMAC = function(mac) { return (new UCI.validators.MACAddressValidator()).validate({value: mac}); }
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
				$uci.firewall.create({".type": "rule", "parental": true}).done(function(rule){
					rule[".new"] = true; 
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
				$scope.rule = null; 
			}
			
			$scope.onCancelEdit = function(){
				if($scope.rule && $scope.rule.uci_rule && $scope.rule.uci_rule[".new"]){
					$scope.rule.uci_rule.$delete(); 
				}
				$scope.rule = null; 
			}
			
			$scope.$apply(); 
		}
	]); 
}); 
