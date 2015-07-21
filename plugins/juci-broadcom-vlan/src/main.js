JUCI.app.run(function($network, $uci){
	$network.subsystem(function(){
		return {
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
}); 

UCI.$registerConfig("layer2_interface_vlan"); 
UCI.layer2_interface_vlan.$registerSectionType("vlan_interface", {
	"name":					{ dvalue: '', type: String }, 
	"ifname":					{ dvalue: '', type: String }, 
	"baseifname":					{ dvalue: '', type: String }, 
	"vlan8021q":					{ dvalue: '101', type: String }, 
	"vlan8021p":					{ dvalue: '5', type: String }
}); 
