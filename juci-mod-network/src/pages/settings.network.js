JUCI.app
.controller("SettingsNetworkCtrl", function($scope, $uci, $config){
	function draw() {
		/*
		 * Example for FontAwesome
		 */
		var options = {
			layout: {
				hierarchical: {
					sortMethod: "hubsize"
				}
			}, 
			groups: {
				networks: {
					shape: 'icon',
					icon: {
						face: 'FontAwesome',
						code: '\uf1db',
						size: 50,
						color: '#57169a'
					}
				},
				interfaces: {
					shape: 'icon',
					icon: {
						face: 'FontAwesome',
						code: '\uf111',
						size: 50,
						color: '#aa00ff'
					}
				}
			}
		};

		// create an array with nodes
		var nodes = []; 
		var edges = []; 
		
		nodes.push({
			id: 0, 
			label: $config.hardware_model, 
			group: "networks"
		}); 
		$uci.network['@interface'].map(function(i){
			var net_id = nodes.length; 
			nodes.push({
				id: nodes.length, 
				label: i[".name"], 
				group: "networks"
			}); 
			edges.push({
				from: 0, 
				to: net_id
			}); 
			
			var parts = []; 
			if(i.device && i.device.value != "") parts = i.device.value.split(" "); 
			else if(i.ifname.value) parts = i.ifname.value.split(" "); 
			if(parts.length){
				parts.map(function(p){
					var eth_id = nodes.length; 
					nodes.push({
						id: nodes.length, 
						label: p, 
						group: "interfaces"
					}); 
					edges.push({
						from: net_id, 
						to: eth_id
					}); 
				}); 
			}
		}); 
		
		// create a network
		var container = document.getElementById('mynetworkFA');
		var data = {
			nodes: nodes,
			edges: edges
		};

		var networkFA = new vis.Network(container, data, options);
	}
	$uci.sync("network").done(function(){
		$scope.network = $uci.network; 
		$scope.interfaces = $uci.network['@interface'].filter(function(i){ return i.type.value != "" && i.is_lan.value == true}); 
		$scope.$apply(); 
		draw(); 
	}); 
}); 
