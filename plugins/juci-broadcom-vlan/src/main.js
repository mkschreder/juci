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
				Object.keys(ports).map(function(port){
					adapters.push({
						name: port.name, 
						device: port.ifname, 
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
	"name":					{ dvalue: '', type: String }, 
	"ifname":					{ dvalue: '', type: String }, 
	"baseifname":					{ dvalue: '', type: String }, 
	"vlan8021q":					{ dvalue: '101', type: String }, 
	"vlan8021p":					{ dvalue: '5', type: String }
}); 
