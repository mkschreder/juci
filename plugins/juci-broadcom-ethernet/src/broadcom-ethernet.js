JUCI.app.factory("$broadcomEthernet", function($rpc, $uci){
	// fire off initial sync
	var sync = $uci.$sync(["layer2_interface_ethernet", "ports"]);
	
	function Ethernet(){
		
	}
	
	Ethernet.prototype.configureWANPort = function(devname){
		var def = $.Deferred(); 
		// WAN port for broadcom phy must be configured specially so we do it in layer2_interface_ethernet (the name is a little misleading because the config is only used to set wan port on the ethernet connector!)
		var wans = $uci.layer2_interface_ethernet["@ethernet_interface"]; 
		function setInterface(devname){
			var wan = $uci.layer2_interface_ethernet.Wan; 
			wan.ifname.value = devname + ".1";
			wan.baseifname.value = devname;  
		}
		if(!$uci.layer2_interface_ethernet.Wan){
			$uci.layer2_interface_ethernet.$create({
				".type": "ethernet_interface", 
				".name": "Wan"
			}).done(function(){
				setInterface(devname); 
				def.resolve(); 
			}); 
		} else {
			setInterface(devname);
			setTimeout(function(){ def.resolve(); }, 0);  
		}
		return def.promise(); 
	}
	
	Ethernet.prototype.annotateAdapters = function(adapters){
		var def = $.Deferred(); 
		var self = this; 
		self.getPorts().done(function(list){
			var ports = {};
			list.map(function(x){ ports[x.id] = x; }); 
			var to_remove = []; // list of interface indexes to remove
			adapters.forEach(function(dev, idx){
				// remove bcm switch interface from the list because it should never be used
				if(dev.device == "bcmsw") to_remove.unshift(idx); 
				if(dev.device in ports){
					dev.name = ports[dev.device].name; 
					dev.type = ports[dev.device].type; 
					delete ports[dev.device]; 
				} else if(dev.device && dev.device.match(/br-.*/)){
					// rename the bridge to a better name
					dev.name = dev.device.substr(3).toUpperCase() + "-BRIDGE"; 
					dev.type = "eth-bridge" 
				} else if(dev.device == "lo"){
					dev.name = "LOOPBACK"; 
					dev.type = "eth"
				}
			});
			to_remove.forEach(function(i){ adapters.splice(i, 1); }); 	
			/*Object.keys(ports).map(function(k){
				var port = ports[k]; 
				adapters.push({
					name: port.name, 
					device: port.id, 
					type: port.type, 
					state: "DOWN"
				}); 
			});*/ 
			def.resolve(); 
		}).fail(function(){
			def.reject(); 
		}); 
		return def.promise(); 
	}

	Ethernet.prototype.getPorts = function(){
		var def = $.Deferred(); 
		
		sync.done(function(){
			var devices = [];
			if($uci.ports && $uci.ports["@ethport"]){
				devices = $uci.ports["@ethport"].map(function(port){
					return {
						get name(){ return port.name.value; },
						get id(){ return port.ifname.value; },
						get type(){ return "eth-port" },
						base: { name: port.name.value, id: port.ifname.value }
					};
				});
			}
			if($uci.layer2_interface_ethernet.Wan){
				var port = $uci.layer2_interface_ethernet.Wan;
				devices.push({
					get name(){ return "WAN"; },
					get id(){ return port.ifname.value; },
					get type(){ return "vlan"; }
				});
			}
			def.resolve(devices);
		}); 
		return def.promise(); 
	}
	
	return new Ethernet(); 
});

JUCI.app.run(function($ethernet, $broadcomEthernet){
	$ethernet.addSubsystem($broadcomEthernet); 
}); 

UCI.$registerConfig("layer2_interface_ethernet"); 
UCI.layer2_interface_ethernet.$registerSectionType("ethernet_interface", {
	"name":					{ dvalue: '', type: String }, 
	"ifname":				{ dvalue: '', type: String }, 
	"baseifname":			{ dvalue: '', type: String },
	"bridge":				{ dvalue: false, type: Boolean }
}); 

UCI.$registerConfig("ports"); 
UCI.ports.$registerSectionType("ethport", {
	"ifname": 	{ dvalue: "", type: String }, 
	"speed": 	{ dvalue: "auto", type: String }, 
	"pause": 	{ dvalue: false, type: Boolean },
	"name":		{ dvalue: "", type: String }
}); 

