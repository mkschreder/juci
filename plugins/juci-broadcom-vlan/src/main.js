//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app.factory("$broadcomVLAN", function($uci, $rpc){
	return {
		annotateAdapters: function(adapters){
			var def = $.Deferred(); 
			var self = this; 
			self.getDevices().done(function(list){
				var ports = {};
				list.map(function(x){ ports[x.id] = x; }); 
				adapters.map(function(adapter){
					if(adapter.device in ports) {
						adapter.name = ports[dev.device].name; 
						delete ports[dev.device]; 
					}
				}); 
				Object.keys(ports).map(function(port){
					adapters.push({
						name: port.name, 
						device: port.id, 
						type: port.type, 
						state: "DOWN"
					}); 
				}); 
				def.resolve(); 
			}).fail(function(){
				def.reject(); 
			}); 
			return def.promise(); 
		}, 
		getDevices: function() {
			var deferred = $.Deferred(); 
			var devices = []; 
			$uci.sync("layer2_interface_vlan").done(function(){
				$uci.layer2_interface_vlan["@vlan_interface"].map(function(i){
					devices.push({
						get name(){ return i.name.value; }, 
						get id() { return i.ifname.value; },
						get type(){ return "vlan"; }, 
						base: i
					}); 
				}); 
			}).always(function(){
				deferred.resolve(devices); 
			}); 
			return deferred.promise(); 
		}
	}
}); 

JUCI.app.run(function($ethernet, $network, $uci, $broadcomVLAN){
	$ethernet.addSubsystem($broadcomVLAN); 
}); 

UCI.$registerConfig("layer2_interface_vlan"); 
UCI.layer2_interface_vlan.$registerSectionType("vlan_interface", {
	"name":					{ dvalue: '', type: String }, 
	"ifname":					{ dvalue: '', type: String }, 
	"baseifname":					{ dvalue: '', type: String }, 
	"vlan8021q":					{ dvalue: '101', type: String }, 
	"vlan8021p":					{ dvalue: '5', type: String }
}); 
