JUCI.app
.factory("$firewall", function($uci){
	var firewall = 0; 
	function sync(){
		var deferred = $.Deferred(); 
		if(firewall) setTimeout(function(){ deferred.resolve(); }, 0); 
		else {
			$uci.sync("firewall").done(function(){
				firewall = $uci.firewall; 
				deferred.resolve(); 
			}); 
		}
		return deferred.promise(); 
	}
	return {
		getZones: function(){
			var deferred = $.Deferred(); 
			sync().done(function(){
				deferred.resolve($uci.firewall["@zone"]); 
			}); 
			return deferred.promise(); 
		}, 
		getRules: function(opts){
			var deferred = $.Deferred(); 
			if(!opts) opts = {}; 
			sync().done(function(){
				if(opts.from_zone){
					var rules = $uci.firewall["@rule"].filter(function(rule){
						return rule.src == opts.from_zone; 
					});
					deferred.resolve(rules); 
				} if(opts.to_zone){
					var rules = $uci.firewall["@rule"].filter(function(rule){
						return rule.dest == opts.to_zone; 
					});
					deferred.resolve(rules); 
				} else { 
					deferred.resolve($uci.firewall["@rule"]); 
				}
			}); 
			return deferred.promise(); 
		}, 
		
		// we determine what networks are wan/lan/guest based on zones. This is currently hardcoded,
		// but probably should not be in the future. This will break if the user has different zone names!
		getLanZone: function(){ 
			var deferred = $.Deferred(); 
			sync().done(function(){
				deferred.resolve($uci.firewall["@zone"].find(function(x){ return x.name.value == "lan"; })); 
			}); 
			return deferred.promise(); 
		},
		
		getGuestZone: function(){ 
			var deferred = $.Deferred(); 
			sync().done(function(){
				deferred.resolve($uci.firewall["@zone"].find(function(x){ return x.name.value == "guest"; })); 
			}); 
			return deferred.promise(); 
		},
		
		getWanZone: function(){ 
			var deferred = $.Deferred(); 
			sync().done(function(){
				deferred.resolve($uci.firewall["@zone"].find(function(x){ return x.name.value == "wan"; })); 
			}); 
			return deferred.promise(); 
		}, 
		
		nat: {
			enable: function(value){
				$uci.sync("firewall").done(function(){
					$uci.firewall["@redirect"].map(function(rule){
						rule.enabled.value = value; 
					}); 
				}); 
			}, 
			isEnabled: function(){
				var def = $.Deferred(); 
				$uci.sync("firewall").done(function(){
					var enabled = $uci.firewall["@redirect"].find(function(rule){
						return rule.enabled.value; 
					}); 
					if(enabled) def.resolve(true); 
					else def.resolve(false); 
				}); 
				return def.promise(); 
			}
		}
	}; 
}); 

UCI.$registerConfig("firewall"); 
UCI.firewall.$registerSectionType("defaults", {
	"syn_flood":		{ dvalue: true, type: Boolean }, 
	"input":				{ dvalue: "ACCEPT", type: String }, 
	"output":				{ dvalue: "ACCEPT", type: String }, 
	"forward":			{ dvalue: "REJECT", type: String }
}); 
UCI.firewall.$registerSectionType("zone", {
	"name":					{ dvalue: "", type: String }, 
	"input":				{ dvalue: "ACCEPT", type: String }, 
	"output":				{ dvalue: "ACCEPT", type: String }, 
	"forward":			{ dvalue: "REJECT", type: String }, 
	"network": 			{ dvalue: [], type: Array }, 
	"masq":					{ dvalue: true, type: Boolean }, 
	"mtu_fix": 			{ dvalue: true, type: Boolean }
}); 
UCI.firewall.$registerSectionType("redirect", {
	"name":					{ dvalue: "", type: String }, 
	"enabled":			{ dvalue: true, type: Boolean }, 
	"src":					{ dvalue: "", type: String }, 
	"dest":					{ dvalue: "", type: String }, 
	"src_ip":				{ dvalue: "", type: String, validator: UCI.validators.IPAddressValidator  },
	"src_dport":		{ dvalue: "", type: String, validator: UCI.validators.PortValidator },
	"proto":				{ dvalue: "", type: String }, 
	"dest_ip":			{ dvalue: "", type: String, validator: UCI.validators.IPAddressValidator  }, 
	"dest_port":		{ dvalue: "", type: String, validator: UCI.validators.PortValidator }
}); 
UCI.firewall.$registerSectionType("include", {
	"path": 				{ dvalue: "", type: String }, 
	"type": 				{ dvalue: "", type: String }, 
	"family": 			{ dvalue: "", type: String }, 
	"reload": 			{ dvalue: true, type: Boolean }
}); 
UCI.firewall.$registerSectionType("dmz", {
	"enabled": 			{ dvalue: false, type: Boolean }, 
	"host": 				{ dvalue: "", type: String } // TODO: change to ip address
}); 
UCI.firewall.$registerSectionType("rule", {
	"type": 				{ dvalue: "generic", type: String }, 
	"name":					{ dvalue: "", type: String }, 
	"src":					{ dvalue: "lan", type: String }, 
	"src_ip":				{ dvalue: "", type: String }, // needs to be extended type of ip address/mask
	"src_mac": 			{ dvalue: [], type: Array, validator: UCI.validators.MACListValidator }, 
	"src_port":			{ dvalue: 0, type: Number }, 
	"proto":				{ dvalue: "tcp", type: String }, 
	"dest":					{ dvalue: "*", type: String }, 
	"dest_ip":			{ dvalue: "", type: String }, // needs to be extended type of ip address/mask
	"dest_port":		{ dvalue: 0, type: Number }, 
	"target":				{ dvalue: "REJECT", type: String }, 
	"family": 			{ dvalue: "ipv4", type: String }, 
	"icmp_type": 		{ dvalue: [], type: Array },
	"enabled": 			{ dvalue: true, type: Boolean },
	"hidden": 			{ dvalue: true, type: Boolean }, 
	"limit":				{ dvalue: "", type: String }, 
	// scheduling
	"parental": 			{ dvalue: false, type: String }, 
	"weekdays":				{ dvalue: "", type: String }, 
	"start_time":			{ dvalue: "", type: String, validator:  UCI.validators.TimeValidator }, 
	"stop_time":			{ dvalue: "", type: String, validator:  UCI.validators.TimeValidator }, 
}); 
UCI.firewall.$registerSectionType("settings", {
	"disabled":			{ dvalue: false, type: Boolean },
	"ping_wan":			{ dvalue: false, type: Boolean }
}); 
UCI.firewall.$registerSectionType("urlblock", {
	"enabled": { dvalue: false, type: Boolean }, 
	"url": 					{ dvalue: [], type: Array }, 
	"src_mac": 			{ dvalue: [], type: Array, validator: UCI.validators.MACListValidator }, 
}); 
