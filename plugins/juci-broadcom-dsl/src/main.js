//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.factory("$broadcomDsl", function($ethernet, $uci, $rpc){
	return {
		annotateAdapters: function(adapters){
			var def = $.Deferred(); 
			var self = this; 
			self.getDevices().done(function(list, devices){
				adapters.map(function(adapter){
					if(adapter.device in devices){
						var dev = devices[adapter.device]; 
						adapter.name = dev.name; 
						delete devices[adapter.device]; 
					}
				}); 
				Object.keys(devices).map(function(devid){
					var dev = devices[devid]; 
					adapters.push({
						name: dev.name,
						device: dev.id, 
						link_type: dev.type, 
						state: "DOWN"
					}); 
				}); 
				def.resolve(adapters);  
			}); 
			return def.promise(); 
		},
		getDevices: function() {
			var deferred = $.Deferred(); 
			var devices = {}; 
			$uci.$sync(["layer2_interface_vdsl", "layer2_interface_adsl"]).done(function(result){
				$uci.layer2_interface_vdsl["@vdsl_interface"].map(function(device){
					devices[device.ifname.value] = {
						get name() { return device.name.value; }, 
						get id() { return device.ifname.value; }, 
						get type() { return "vdsl"; }, 
						base: device
					}; 
				}); 
				$uci.layer2_interface_adsl["@atm_bridge"].map(function(device){
					devices[device.ifname.value] = {
						get name() { return device.name.value; }, 
						get id() { return device.ifname.value; }, 
						get type() { return "adsl"; }, 
						base: device
					}; 
				}); 
				deferred.resolve(Object.keys(devices).map(function(k){ return devices[k]; }), devices); 
			}); 
			return deferred.promise(); 
		}, 
		status: function(){
			return $rpc.juci.broadcom.dsl.status(); 
		}
	}; 
}).run(function($ethernet, $network, $uci, $broadcomDsl){
	$ethernet.addSubsystem($broadcomDsl); 
	$network.subsystem(function(){
		return {
			getDevices: function(){
				return $broadcomDsl.getDevices(); 
			}
		}
	}); 
}); 


UCI.$registerConfig("layer2_interface_adsl"); 
UCI.layer2_interface_adsl.$registerSectionType("atm_bridge", {
	"unit":		{ dvalue: "", type: String }, 
	"ifname":		{ dvalue: "", type: String }, 
	"baseifname":		{ dvalue: "", type: String }, 
	"vci":		{ dvalue: "", type: String }, 
	"vpi":		{ dvalue: "", type: String }, 
	"atmtype":		{ dvalue: "", type: String }, 
	"pcr":		{ dvalue: "", type: String }, 
	"scr":		{ dvalue: "", type: String }, 
	"mbs":		{ dvalue: "", type: String }, 
	"name":		{ dvalue: "", type: String }, 
	"link_type":		{ dvalue: "", type: String }, 
	"encapseoa":		{ dvalue: "", type: String }
});

UCI.$registerConfig("layer2_interface_vdsl"); 
UCI.layer2_interface_vdsl.$registerSectionType("vdsl_interface", {
	"unit":		{ dvalue: "", type: String }, 
	"ifname":		{ dvalue: "", type: String }, 
	"baseifname":		{ dvalue: "", type: String }, 
	"name":		{ dvalue: "", type: String }, 
	"dslat":		{ dvalue: "", type: String }, 
	"ptmprio":		{ dvalue: "", type: String }, 
	"ipqos":		{ dvalue: "", type: String }
});
