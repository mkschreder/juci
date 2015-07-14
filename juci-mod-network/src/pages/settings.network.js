JUCI.app
.controller("SettingsNetworkCtrl", function($scope, $uci, $network, $config){
	function drawCyGraph(){
		var nodes = []; 
		var edges = []; 
		
		nodes.push({
			data: {
				id: "root", 
				name: $config.hardware_model, 
				group: "networks",
				weight: 100, 
				mainColor: '#F5A45D', 
				shape: 'rectangle'
			}
		});
		nodes.push({
			data: {
				id: "world", 
				name: "WAN", 
				parent: "root", 
				weight: 100, 
				mainColor: "#0000ff", 
				shape: "rectangle"
			}
		}); 
		nodes.push({
			data: {
				id: "user", 
				name: "Local", 
				parent: "root", 
				weight: 100, 
				mainColor: "#00ff00", 
				shape: "rectangle"
			}
		}); 
		$scope.networks.map(function(i){
			var net_id = i[".name"]; 
			// add a wan connection if the interface is connected to wan
			var parent = "root"; 
			var icon = "default.png"; 
			var item = {
				id: net_id, 
				name: net_id,
				network: i, 
				weight: 70, 
				mainColor: '#F5A45D', 
				shape: 'rectangle'
			}; 
			if(net_id == $config.wan_interface || net_id == $config.voice_interface || net_id == $config.iptv_interface || net_id == $config.ipv6_interface){
				item.parent = "world"; 
			} else if(net_id == "lan"){
				item.parent = "user"; 
			} else if(net_id == "guest"){
				item.parent = "user"; 
			} else if(net_id == "loopback") { 
				item.parent = "user"; 
				item.shape = "octagon"; 
				item.color = "#0000aa"; 
			}
			
			nodes.push({
				data: item
			}); 
			
			
			var parts = []; 
			if(i.device && i.device.value != "") parts = i.device.value.split(" "); 
			else if(i.ifname.value) parts = i.ifname.value.split(" "); 
			if(parts.length){
				parts.map(function(p){
					var eth_id = nodes.length; 
					var item = {
						id: p, 
						name: p, 
						parent: net_id,
						weight: 70, 
						mainColor: '#F5A45D', 
						shape: 'rectangle'
					};
					if(p.match(/.*eth.*/)) item.icon = "lan_port.png"; 
					
					nodes.push({
						data: item
					}); 
					
				}); 
			}
		});
		
		nodes = nodes.map(function(n){
			//if(!n.data.icon) n.data.icon = "none";
			if(n.data.icon) n.data.icon = "/img/"+n.data.icon;  
			return n; 
		}); 
		
		$('#cy').cytoscape({
			layout: {
				name: 'grid',
				padding: 10
			},
			zoomingEnabled: false, 
			style: cytoscape.stylesheet()
				.selector('node')
					.css({
						'shape': 'data(shape)',
						'width': 'mapData(weight, 40, 80, 20, 60)',
						'content': 'data(name)',
						'text-valign': 'top',
						'text-outline-width': 1,
						'text-outline-color': 'data(mainColor)',
						'background-color': 'data(mainColor)', 
						'color': '#fff'
					})
				.selector('[icon]')
					.css({
						'background-image': 'data(icon)',
						'background-fit': 'cover'
					})
				.selector(':selected')
					.css({
						'border-width': 3,
						'border-color': '#333'
					})
				.selector('edge')
					.css({
						'opacity': 0.666,
						'width': 'mapData(strength, 70, 100, 2, 6)',
						'target-arrow-shape': 'triangle',
						'source-arrow-shape': 'circle',
						'line-color': 'data(color)',
						'source-arrow-color': 'data(color)',
						'target-arrow-color': 'data(color)'
					})
				.selector('edge.questionable')
					.css({
						'line-style': 'dotted',
						'target-arrow-shape': 'diamond'
					})
				.selector('.faded')
					.css({
						'opacity': 0.25,
						'text-opacity': 0
					}),
			
			elements: {
				nodes: nodes,
				edges: edges
			},
			
			ready: function(){
				window.cy = this;
				cy.on('tap', 'node', { foo: 'bar' }, function(evt){
					var node = evt.cyTarget;
					var network = node.data().network; 
					if(network){
						console.log("Selected network "+node.id()); 
						$scope.selected_network = network; 
						$scope.$apply(); 
					} else {
						console.log("Looking for device "+node.id()); 
						$network.getDevice({ name: node.id() }).done(function(device){
							$scope.selected_device = device; 
							$scope.$apply(); 
						}); 
					}
					console.log( 'tapped ' + node.id() );
				});
			}
		});
	}
	$uci.sync("network").done(function(){
		$scope.network = $uci.network; 
		$scope.interfaces = $uci.network['@interface'].filter(function(i){ return i.type.value != "" && i.is_lan.value == true}); 
		$network.getNetworks().done(function(nets){
			$scope.networks = nets; 
			$scope.$apply(); 
			drawCyGraph(); 
		}); 
	}); 
}); 
