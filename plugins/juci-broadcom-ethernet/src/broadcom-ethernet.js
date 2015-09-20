JUCI.app.factory("$broadcomEthernet", function($rpc, $uci){
	// fire off initial sync
	var sync = $uci.sync("layer2_interface_ethernet");
	
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
		if($uci.layer2_interface_ethernet.Wan == 0){
			$uci.layer2_interface_ethernet.create({
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
	
	Ethernet.prototype.annotateAdapters = function(devs){
		var def = $.Deferred(); 
		var self = this; 
		self.getPorts().done(function(list){
			var ports = {};
			list.map(function(x){ ports[x.id] = x; }); 
			alert(Object.keys(ports)); 
			devs.map(function(dev){
				if(dev.device in ports) dev.name = ports[dev.device].name; 
			}); 
			def.resolve(devs); 
		}).fail(function(){
			def.reject(); 
		}); 
		return def.promise(); 
	}

	Ethernet.prototype.getPorts = function(){
		var def = $.Deferred(); 
		
		sync.done(function(){
			if($rpc.router && $rpc.router.boardinfo){
				$rpc.router.boardinfo().done(function(boardinfo){
					var names = boardinfo.ethernet.port_names.split(" "); 
					var devs = boardinfo.ethernet.port_order.split(" "); 
						
					var devices = devs.map(function(dev, i){
						return {
							get name(){ return names[i]; },
							get id(){ return dev; },
							get type(){ return "baseif"; },
							is_wan_port: ($uci.layer2_interface_ethernet.Wan && ($uci.layer2_interface_ethernet.Wan.baseifname.value == dev)),
							base: { name: names[i], id: dev }
						}; 
					});
					def.resolve(devices);  
				}); 
			} else {
				def.resolve([]); 
			}
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
	"pause": 	{ dvalue: false, type: Boolean }
}); 

