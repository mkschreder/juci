//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.directive("overviewSliderWidget10Network", function(){
	return {
		templateUrl: "widgets/overview-slider-network.html", 
		controller: "overviewSliderWidget10Network", 
		replace: true
	 };  
})
.controller("overviewSliderWidget10Network", function($scope, $uci, $rpc, $network, $firewall, $config){
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
				name: "Public", 
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
		var freedevs = {}; 
		$scope.devices.map(function(x){ freedevs[x.name] = x; }); 
		
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
			
			if(i.devices && i.devices instanceof Array){
				
				i.devices.map(function(dev){
					// remove from list of free devices
					delete freedevs[dev.name]; 
					
					var dev_id = nodes.length; 
					var item = {
						id: dev.name, 
						name: dev.name, 
						parent: net_id,
						weight: 70, 
						mainColor: '#F5A45D', 
						shape: 'rectangle'
					};
					if(dev.name.match(/.*eth.*/)) item.icon = "lan_port.png"; 
					
					nodes.push({
						data: item
					}); 
				}); 
				
			}
		});
		// now add all free devices as just floating items
		Object.keys(freedevs).map(function(k){
			nodes.push({
				data: {
					id: k, 
					name: k, 
					parent: "root", 
					weight: 70, 
					mainColor: '#aaaaaa', 
					shape: 'rectangle'
				}
			}); 
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
				cy.on('tapstart', 'node', {}, function(ev){
					var node = ev.cyTarget; 
					console.log("Tapstart: "+node.id()); 
				}); 
				cy.on('tapend', 'node', {}, function(ev){
					var node = ev.cyTarget; 
					console.log("Tapend: "+node.id()); 
					
				}); 
			}
		});
	}
	
	var nodes = []; 
	var edges = []; 
	
	function drawVisGraph(){
		/*
		 * Example for FontAwesome
		 */
		var optionsFA = {
			groups: {
				networks: {
					shape: 'icon',
					icon: {
						face: 'FontAwesome',
						code: '\uf0c0',
						size: 50,
						color: '#57169a'
					}
				},
				users: {
					shape: 'icon',
					icon: {
						face: 'FontAwesome',
						code: '\uf007',
						size: 50,
						color: '#aa00ff'
					}
				}
			}
		};

		// create an array with nodes
		var nodesFA = [{
			id: "lan",
			label: 'User 1',
			group: 'users', 
			x: -400, 
			y: 0, 
			physics: false, 
			fixed: { x: true, y: true }
		}, {
			id: 2,
			label: 'User 2',
			group: 'users',
			x: 0, 
			y: 0, 
			physics: false, 
			fixed: { x: true, y: true }
		}, {
			id: 3,
			label: 'Usergroup 1',
			group: 'usergroups'
		}, {
			id: 4,
			label: 'Usergroup 2',
			group: 'usergroups'
		}, {
			id: 5,
			label: 'Organisation 1',
			shape: 'icon',
			icon: {
				face: 'FontAwesome',
				code: '\uf1ad',
				size: 50,
				color: '#f0a30a'
			}
		}];

		// create an array with edges
		var edges = [{
			from: 1,
			to: 3
		}, {
			from: 1,
			to: 4
		}, {
			from: 2,
			to: 4
		}, {
			from: 3,
			to: 5
		}, {
			from: 4,
			to: 5
		}];

		// create a network
		var containerFA = document.getElementById('mynetworkFA');
		var dataFA = {
			nodes: nodesFA,
			edges: edges
		};

		var networkFA = new vis.Network(containerFA, dataFA, optionsFA);
	}
	
	var optionsFA = {
		nodes: {
			color: "#999999", 
			font: {size:15, color:'white' }, 
			borderWidth: 3
		},
		groups: {
			users: {
				shape: 'icon',
				icon: {
					face: 'FontAwesome',
					code: '\uf0c0',
					size: 30,
					color: '#57169a'
				}
			},
			networks: {
				shape: 'icon',
				icon: {
					face: 'Ionicons',
					code: '\uf341',
					size: 30,
					color: '#009900'
				}
			},
			networks_down: {
				shape: 'icon',
				icon: {
					face: 'Ionicons',
					code: '\uf341',
					size: 30,
					color: '#990000'
				}
			},
			static: {
				shape: 'icon',
				icon: {
					face: 'FontAwesome',
					code: '\uf1ad',
					size: 30,
					color: '#f0a30a'
				}
			},
			wan: {
				shape: 'icon',
				icon: {
					face: 'Ionicons',
					code: '\uf38c',
					size: 30,
					color: '#f0a30a'
				}
			}
		}
	};
	
	nodes.push({
		id: ".root",
		label: $config.system.hardware,
		image: "/img/net-router-icon.png", 
		shape: "image", 
		x: 0, y: 0, 
		size: 60, 
		physics: false, 
		fixed: { x: true, y: true }
	}); 
	
	nodes.push({
		id: ".lan_hub",
		x: -90, y: 0, 
		physics: false, 
		fixed: { x: true, y: true }
	});
	edges.push({ from: ".root", to: ".lan_hub", width: 8, smooth: { enabled: false } }); 
	
	$network.getNameServers().done(function(nameservers){
		$network.getConnectedClients().done(function(clients){
			$rpc.network.interface.dump().done(function(stats){
				var interfaces = stats.interface; 
				var gw_if = interfaces.find(function(x){ return x.route && x.route[0] && x.route[0].target == "0.0.0.0"; }); 
				$firewall.getZones().done(function(zones){
					var wan = zones.find(function(x){ return x.name.value == "wan"; }); 
					var lan = zones.find(function(x){ return x.name.value == "lan"; }); 
					var guest = zones.find(function(x){ return x.name.value == "guest"; }); 
					
					[wan, lan, guest].map(function(zone){
						if(!zone) return; 
						var node = {
							id: "zone."+zone.name.value, 
							label: String(zone.name.value).toUpperCase(), 
							image: "/img/net-interface-icon.png", 
							shape: "image",
							physics: false, 
							fixed: { x: false, y: false }
						}
						if(zone == wan) { node.x = 150; node.y = 0; node.image = "/img/net-interface-wan-icon.png"}
						else if(zone == lan) { node.x = -180; node.y = -50; }
						else if(zone == guest) { node.x = -180; node.y = 50; }
						nodes.push(node);
						
						if(zone != wan)
							edges.push({ from: ".lan_hub", to: node.id, width: 6, smooth: { enabled: false } }); 
						else 
							edges.push({ from: ".root", to: node.id, width: 6, smooth: { enabled: false } }); 
							
						// add devices from the zone
						zone.network.value.map(function(iface_name){
							var iface = interfaces.find(function(x){ return x.interface == iface_name; }); 
							if(!iface) return; 
							clients.filter(function(x){ return x.device == iface.l3_device; }).map(function(cl){
								// add client to the node list
								var cl_node = {
									id: cl.ipaddr, 
									label: cl.ipaddr, 
									image: "/img/net-laptop-icon.png", 
									shape: "image",
									x: node.x * 2, 
									fixed: { x: true, y: false }
								}; 
								var flags = []; 
								if(gw_if && gw_if.route[0].nexthop == cl.ipaddr) flags.push("Default GW"); 
								if(nameservers.find(function(x){ return x == cl.ipaddr; })) flags.push("DNS"); 
								if(flags.length) cl_node.label = "("+flags.join("/")+") "+cl_node.label; 
								if(cl.hostname) cl_node.label = cl_node.label + " (" + cl.hostname + ")"; 
								nodes.push(cl_node); 
								edges.push({ from: node.id, to: cl_node.id, width: 2 });  
							}); 
						}); 
					}); 
					
					// create a network
					var containerFA = document.getElementById('mynetworkFA');
					var dataFA = {
						nodes: nodes,
						edges: edges
					};

					var network = new vis.Network(containerFA, dataFA, optionsFA);
					$scope.$apply(); 
				}); 
			}); 
		}); 
	}); 
})
