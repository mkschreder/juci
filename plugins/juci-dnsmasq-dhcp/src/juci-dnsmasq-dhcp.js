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

UCI.$registerConfig("dhcp"); 
UCI.dhcp.$registerSectionType("dnsmasq", {
	"domainneeded":		{ dvalue: true, type: Boolean },
	"dhcpleasemax":		{ dvalue: undefined, type: Number },
	"boguspriv":		{ dvalue: true, type: Boolean },
	"localise_queries":	{ dvalue: true, type: Boolean },
	"rebind_protection":{ dvalue: false, type: Boolean },
	"rebind_localhost":	{ dvalue: false, type: Boolean },
	"dnsforwardmax":	{ dvalue: undefined, type: Number },
	"rebind_domain":	{ dvalue: [], type: Array },
	"ednspacket_max":	{ dvalue: undefined, type: Number },
	"local":			{ dvalue: "", type: String, required: true},
	"port":				{ dvalue: 53, type: Number },
	"domain":			{ dvalue: "", type: String, required: true},
	"logqueries":		{ dvalue: false, type: Boolean },
	"filterwin2k":		{ dvalue: false, type: Boolean },
	"queryport":		{ dvalue: undefined, type: Number },
	"addnhosts":		{ dvalue: [], type: Array },
	"bogusnxdomain":	{ dvalue: [], type: Array },
	"server":			{ dvalue: [], type: Array },
	"noresolv":			{ dvalue: false, type: Boolean },
	"nonegcache":		{ dvalue: false, type: Boolean },
	"strictorder":		{ dvalue: false, type: Boolean },
	"expandhosts":		{ dvalue: true, type: Boolean },
	"authoritative":	{ dvalue: true, type: Boolean },
	"readethers":		{ dvalue: true, type: Boolean },
	"leasefile":		{ dvalue: "/tmp/dhcp.leases", type: String },
	"resolvfile":		{ dvalue: "/tmp/resolv.conf.auto", type: String }
});
UCI.dhcp.$registerSectionType("dhcp", {
	"interface":		{ dvalue: "", type: String, required: true},
	"start":		{ dvalue: 100, type: Number, validator: UCI.validators.NumberLimitValidator(1, 255) },
	"limit":		{ dvalue: 150, type: Number, validator: UCI.validators.NumberLimitValidator(1, 255) },
	"leasetime":		{ dvalue: "12h", type: String, required: true},
	"ignore":		{ dvalue: false, type: Boolean }
});
UCI.dhcp.$registerSectionType("domain", {
	"name":		{ dvalue: [], type: Array, },
	"ip":		{ dvalue: "", type: String, required: true },  // TODO: change to ip address
	"family":	{ dvalue: "ipv4", type: String, required: true }
}, function(section){
	// this is very bad design on the dhcpmasq side  
	var validator = (section.family.value == 'ipv4') ? new UCI.validators.IP4AddressValidator() : new UCI.validators.IP6AddressValidator();
	return validator.validate({value: section.ip.value});
});
UCI.dhcp.$registerSectionType("host", {
	"name":		{ dvalue: "", type: String, required: false},
	"dhcp":		{ dvalue: "", type: String, required: true},
	"network": { dvalue: "lan", type: String, required: true }, 
	"mac":		{ dvalue: "", type: String, required: true, validator: UCI.validators.MACAddressValidator },
	"ip":		{ dvalue: "", type: String, required: true, validator: UCI.validators.IPAddressValidator },  // TODO: change to ip address
	"duid": 	{ dvalue: "", type: String }, 
	"hostid": 	{ dvalue: "", type: String }
}, function(sec){
	// make sure we throw an error if there are duplicates
	return ["name", "mac", "ip", "duid", "hostid"].map(function(f){
		var dups = UCI.dhcp["@host"].filter(function(x){ 
			return x != sec && sec[f].value && sec[f].value == x[f].value; 
		}); 
		if(dups.length) {
			return gettext("Duplicate DHCP entry for") + " '" + sec[f].value + "'"; 
		}
	}).filter(function(x){ return x; }); 	
}); 

JUCI.app.factory("lanIpFactory", function($firewall, $tr, gettext){
	return {
		getIp: function(){
			var deferred = $.Deferred();
			var res = { ipv6:"LAN does not have IPv6 configured", ipv4:"LAN does not have IPv4 configured"};
			$firewall.getZoneNetworks("lan").done(function(networks){
				if(networks.length == 0 || !networks[0].$info) return;
				if(networks[0].$info["ipv4-address"].length != 0 && networks[0].$info["ipv4-address"][0].address){
					res.ipv4 = networks[0].$info["ipv4-address"][0].address;
				}
				if(networks[0].$info["ipv6-address"].length == 0 || !networks[0].$info["ipv6-address"][0].address){
					if(networks[0].$info["ipv6-prefix-assignment"].length != 0 && networks[0].$info["ipv6-prefix-assignment"][0].address){
						res.ipv6 = networks[0].$info["ipv6-prefix-assignment"][0].address + "1";
					}else{ 
						res.ipv6 = $tr(gettext("LAN does not have IPv6 configured"));
					}
				}else{
					res.ipv6 = networks[0].$info["ipv4-address"][0].address;
				}
				deferred.resolve(res);
			});
			return deferred;
		}
	}
});
	
