JUCI.app
.directive("overviewSliderWidget10Network", function(){
	return {
		templateUrl: "widgets/overview-slider-network.html", 
		controller: "overviewSliderWidget10Network", 
		replace: true
	 };  
})
.controller("overviewSliderWidget10Network", function($scope, $uci, $rpc, $network, $config){
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
					face: 'FontAwesome',
					code: '\uf1ad',
					size: 30,
					color: '#009900'
				}
			},
			networks_down: {
				shape: 'icon',
				icon: {
					face: 'FontAwesome',
					code: '\uf1ad',
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
			}
		}
	};
	
	$rpc.network.interface.dump().done(function(results){
		var stats = {}; 
		results.interface.map(function(i){ stats[i.interface] = i; }); 
		$network.getClients().done(function(clients){
			$network.getDevices().done(function(devices){
				$scope.devices = devices; 
				$network.getNetworks().done(function(nets){
					$scope.networks = nets; 
					
					var net_y = 0; 
					var nodes_map = {}; 
					var nets_map = {}; 
					
					nodes.push({
						id: "root",
						label: $config.system.hardware,
						group: 'static', 
						x: 0, y: 50, 
						physics: false, 
						fixed: { x: false, y: false }
					}); 
					
					nodes.push({
						id: "wan", 
						label: "WAN", 
						group: "static", 
						x: 100, y: 50, 
						physics: false, 
						fixed: { x: false, y: false }
					}); 
					edges.push({ from: "root", to: "wan", smooth: { enabled: false }}); 
					
					nets.filter(function(net){
						nets_map[net[".name"]] = net; 
						return net.is_lan.value == 1 && net[".name"] != "loopback"; 
					}).map(function(net){
						var node = {
							id: net[".name"],
							label: net[".name"] + " (" + net.ifname.value.split(" ").join(",") + ")",
							group: (stats[net[".name"]].up)?'networks':'networks_down', 
							x: -100, 
							y: net_y, 
							physics: false, 
							fixed: { x: false, y: false }
						}
						edges.push({ from: "root", to: node.id, smooth: { enabled: false } });
						net_y += 80; 
						nodes_map[node.id] = node; 
						nodes.push(node); 
					}); 
					
					net_y = 0; 
					// add wan networks
					[
						{ name: "Internet", iface: $config.wan_interface}, 
						{ name: "IPTV", iface: $config.iptv_interface},
						{ name: "Voice", iface: $config.voice_interface}
					].map(function(item){
						var net = nets_map[item.iface]; 
						var node = {
							id: net[".name"],
							label: item.name + " (" + net.ifname.value.split(" ").join(",") + ")",
							group: (stats[net[".name"]].up)?'networks':'networks_down', 
							x: 200, 
							y: net_y, 
							physics: false, 
							fixed: { x: false, y: false }
						}
						edges.push({ from: "wan", to: node.id, smooth: { enabled: false } });
						net_y += 80; 
						nodes_map[node.id] = node; 
						nodes.push(node); 
					}); 
					
					clients.filter(function(client){
						return client.connected; 
					}).map(function(client){
						var node = {
							id: client.ipaddr,
							label: client.ipaddr + ((client.hostname != "")?(" ("+client.hostname+")"):""),
							group: 'users', 
							x: -200, 
							fixed: { x: true, y: false }
						}
						var netnode = nodes_map[client.network]; 
						if(netnode){ 
							edges.push({ from: node.id, to: netnode.id, smooth: { enabled: false } }); 
						}
						nodes.push(node); 
					}); 
					// create a network
					var containerFA = document.getElementById('mynetworkFA');
					var dataFA = {
						nodes: nodes,
						edges: edges
					};

					var network = new vis.Network(containerFA, dataFA, optionsFA);
					
					network.on("doubleClick", function (params) {
						if(!params.nodes.length) return; 
						var network = nets_map[params.nodes[0]]; 
						if(!network) return; 
						if(network.is_lan.value) JUCI.redirect("internet-lan"); 
						else JUCI.redirect("internet-wan"); 
					});
					
					$scope.$apply(); 
					//drawVisGraph(); 
				}); 
			});  
		}); 
	}); 
})
