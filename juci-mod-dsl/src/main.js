JUCI.app.run(function($network, $uci){
	$network.subsystem(function(){
		return {
			getDevices: function() {
				var deferred = $.Deferred(); 
				var devices = {}; 
				$uci.sync(["layer2_interface_vdsl", "layer2_interface_adsl"]).done(function(result){
					$uci.layer2_interface_vdsl["@vdsl_interface"].map(function(device){
						devices[device.ifname.value] = {
							get name() { return device.ifname.value; }
						}; 
					}); 
					$uci.layer2_interface_adsl["@atm_bridge"].map(function(device){
						devices[device.ifname.value] = {
							get name() { return device.ifname.value; }
						}; 
					}); 
					deferred.resolve(Object.keys(devices).map(function(k){ return devices[k]; })); 
				}); 
				return deferred.promise(); 
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
