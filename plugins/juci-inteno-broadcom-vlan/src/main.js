/*	
	This file is part of JUCI (https://github.com/mkschreder/juci.git)

	Copyright (c) 2015 Martin K. Schröder <mkschreder.uk@gmail.com>

	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
*/ 

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
						adapter.name = ports[adapter.device].name; 
						adapter.type = ports[adapter.device].type; 
						delete ports[adapter.device]; 
					}
				}); 
				Object.keys(ports).map(function(k){
					var port = ports[k]; 
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
			$uci.$sync("layer2_interface_vlan").done(function(){
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
	"name":			{ dvalue: '', type: String }, 
	"ifname":		{ dvalue: '', type: String }, 
	"bridge":		{ dvalue: false, type: Boolean },
	"baseifname":	{ dvalue: '', type: String }, 
	"vlan8021q":	{ dvalue: '', type: Number }, 
	"vlan8021p":	{ dvalue: '', type: Number }
}, function(section){
	var errors = [];
	if(!section.vlan8021p || section.vlan8021p.value == "" || isNaN(section.vlan8021p.value) || section.vlan8021p.value <  0 || section.vlan8021p.value > 7)
		errors.push("VLAN priority must be between 0 and 7");
	if(!section.vlan8021q || section.vlan8021q.value == "" || isNaN(section.vlan8021q.value) || section.vlan8021q.value < 1 || section.vlan8021q.value > 4096)
		errors.push("VLAN Q-tag must be between 1 and 4096");
	if(!section.ifname || section.ifname.value == "" || !section.baseifname || section.baseifname.value == "")
		errors.push("VLAN must have a base-device");
	if(errors.length) return errors;
	return null;
}); 
