UCI.validators.IPAddressValidator = function(){
	this.validate = function(field){
		if(field.value && field.value != "" && !field.value.match(/^\b(?:\d{1,3}\.){3}\d{1,3}\b$/)) return gettext("IP Address must be a valid ipv4 address!"); 
		return null;
	}
}; 

UCI.validators.IP6PrefixLengthValidator = function(){
	this.validate = function(field){
		var valid_values = ["no"];
		for(var i = 48; i <= 64; i++){
			valid_values.push(String(i));
		}
		if(field.value == "" || valid_values.find(function(x){ return x == field.value}) != undefined) return null;
		return gettext("valid values are: 'no' and 48-64");
	}
};

UCI.validators.IP6AddressValidator = function(){
	this.validate = function(field){
		if(field.value && field.value != "" && !field.value.match("^((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*::((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*|((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4})){7}$")) return gettext("Aaddress must be a valid IPv6 address"); 
		return null; 
	}
} 

UCI.validators.MACAddressValidator = function(){
	this.validate = function(field){
		if(field.value == "") return null;
		if(!(typeof field.value == "string") ||
			!field.value.match(/^(?:[A-Fa-f0-9]{2}[:-]){5}(?:[A-Fa-f0-9]{2})$/)) 
			return gettext("Value must be a valid MAC-48 address"); 
		return null; 
	}
}; 

UCI.validators.MACListValidator = function(){
	this.validate = function(field){
		if(field.value instanceof Array){
			var errors = []; 
			field.value.map(function(value){
				if(!value.match(/^(?:[A-Fa-f0-9]{2}[:-]){5}(?:[A-Fa-f0-9]{2})$/))
					errors.push(gettext("value must be a valid MAC-48 address")+": "+value); 
			}); 
			if(errors.length) return errors.join(", "); 
		}
		return null; 
	}
}; 

UCI.validators.REQPrefixValidator = function(){
	this.validate = function(field){
		if(field.value == "auto" || field.value == "no") return null; // ok string values
		var number = parseInt(field.value);
		if(number < 65 && number > -1) return null;
		return gettext("Valid values are: auto, no, 0-64");
	}
};

UCI.$registerConfig("network"); 
UCI.network.$registerSectionType("interface", {
	"is_lan":				{ dvalue: '', type: Boolean }, // please stop relying on this!
	"auto": 				{ dvalue: '', type: Boolean }, // bring up on boot
	"ifname":				{ dvalue: '', type: String }, 
	"device":				{ dvalue: '', type: String }, 
	"proto":				{ dvalue: '', type: String }, 
	"ipaddr":				{ dvalue: '', type: String, validator: UCI.validators.IP4AddressValidator }, 
	"netmask":				{ dvalue: '', type: String, validator: UCI.validators.IP4AddressValidator }, 
	"gateway":				{ dvalue: '', type: String, validator: UCI.validators.IP4AddressValidator }, 
	"ip6addr":				{ dvalue: '', type: String, validator: UCI.validators.IP6AddressValidator }, 
	"ip6gw": 				{ dvalue: '', type: String, validator: UCI.validators.IP6AddressValidator },
	"ip6prefix":			{ dvalue: '', type: String, validator: UCI.validators.IP6AddressValidator }, 
	"ip6gateway":			{ dvalue: '', type: String, validator: UCI.validators.IP6AddressValidator },  
	"ip6assign":			{ dvalue: '', type: Number }, 
	"ip6hint": 				{ dvalue: '', type: String, validator: UCI.validators.IP6AddressValidator },
	"clientid": 			{ dvalue: "", type: String },
	"type":					{ dvalue: '', type: String }, 
	"defaultroute":			{ dvalue: '', type: Boolean },	
	"bridge_instance": 		{ dvalue: '', type: Boolean }, 
	"vendorid":				{ dvalue: '', type: String }, 
	"ipv6":					{ dvalue: '', type: Boolean },
	"dns": 					{ dvalue: [], type: Array }, 
	"macaddr":				{ dvalue: "", type: String, validator: UCI.validators.MACAddressValidator }, 
	"mtu":					{ dvalue: "", type: Number },
	"enabled": 				{ dvalue: true, type: Boolean }, 
	//dhcp settings
	"reqopts":				{ dvalue: "", type: String },
	"metric":				{ dvalue: '', type: Number },
	"iface6rd":				{ dvalue: "", type: String },
	"broadcast": 			{ dvalue: '', type: Boolean }, 
	"hostname": 			{ dvalue: "", type: String }, 
	"peerdns": 				{ dvalue: '', type: Boolean }, 
	//ipv6 settings
	"tunlink":				{ dvalue: "", type: String },
	"ip6prefixlen":			{ dvalue: "", type: String, validator: UCI.validators.IP6PrefixLengthValidator },
	"ip4prefixlen":			{ dvalue: "", type: Number },
	"reqprefix":			{ dvalue: "", type: String, validator: UCI.validators.REQPrefixValidator },
	"reqaddress":			{ dvalue: "", type: String },
	// authentication 
	"auth": 				{ dvalue: "", type: String }, 
	"username": 			{ dvalue: "", type: String }, 
	"password": 			{ dvalue: "", type: String }, 
	// ppp settings
	"tunnelid":				{ dvalie: "", type: Number },
	"_update":				{ dvalue: '', type: Boolean },
	"peeraddr":				{ dvalue: "", type: String, validator: UCI.validators.IPAddressValidator },
	"server":				{ dvalue: "", type: String },
	"_keepalive_failure":	{ dvalue: "", type: Number },
	"_keepalive_interval":	{ dvalue: "", type: Number },
	"demand":				{ dvalue: "", type: Number },
	// pppoe settings
	"ac":					{ dvalue: "", type: String },
	// 3g and dongles
	"modem":				{ dvalue: "", type: String },
	"service":				{ dvalue: "", type: String },
	"maxwait":				{ dvalue: "", type: Number },
	"apn": 					{ dvalue: "", type: String }, 
	"pincode": 				{ dvalue: "", type: String },
	"comdev":				{ dvalue: "", type: String },
	"ttl":					{ dvalue: "", type: Number }
}, function(section){
	if(!section.proto || !section.proto.value || section.proto.value == "") 
		return gettext("Network interface ") + (section[".name"] || section.name || gettext("Unnamed interface")) + gettext(" MUST have  a protocol set");
	var errors = [];
	switch (section.proto.value){
		case "static":
			if(section.ipaddr.value == "" && section.netmask.value == "" && section.ip6addr.value == "")
				errors.push(gettext("Ether ipv4 or ipv6 address is needed"));
			else if(section.ip6addr.value == "" && (section.netmask.value == "" || section.ipaddr.value == ""))
				errors.push(gettext("Both IP Address and netmask is needed for static IPv4 configuration"));
			if(section.ifname.value == "")
				errors.push(gettext("Static interface need physical interface"));
			break;
		case "dhcp":
			if(section.ifname.value == "")
				errors.push(gettext("DHCP interface need physical interface"));
			break;
		case "dhcpv6":
			if(section.ifname.value == "")
				errors.push(gettext("DHCPv6 interface need physical interface"));
			break;
		case "ppp":
			if(section.device.value == "")
				errors.push(gettext("Modem device needed for PPP interface"));
			break;
		case "pppoe":
			if(section.ifname.value == "")
				errors.push(gettext("PPPoE interface need physical interface"));
			break;
		case "pppoa":
			if(section.ifname.value == "")
				errors.push(gettext("PPPoE interface need physical interface"));
			break;
		case "3g":
			if(section.device.value == "")
				errors.push(gettext("Modem device needed for 3G interface"));
			if(section.service.value != "umts" && section.service.value != "umts_only" && section.service.value != "gprs_only" && section.service.value != "evdo")
				errors.push(gettext("Service type needed for 3G interface"));
			if(section.apn.value == "")
				errors.push(gettext("APN needed for 3G interface"));
			break;
		case "4g":
			if(section.modem.value == "")
				errors.push(gettext("Device needed for 4G interface"));
			break;
		case "pptp":
			if(section.server.value == "")
				errors.push(gettext("VPN Server needed for Point-to-Point tunnel"));
			break;
		case "6in4":
			if(section.peeraddr.value == "")
				errors.push(gettext("Remote IPv4 address needed for 6in4 interface"));
			if(section.ip6addr.value == "")
				errors.push(gettext("Local IPv6 address needed for 6in4 interface"));
			break;
		case "6to4":
			//no required values for 6to4 interface
			break;
		case "6rd":
			if(section.peeraddr.value == "")
				errors.push(gettext("Remote IPv4 address needed for IPv6 rapid deployment interface"));
			if(section.ip6prefix.value == "")
				errors.push(gettext("IPv6 prefix needed for IPv6 rapid deployment interface"));
			if(section.ip6prefixlen.value == "")
				errors.push(gettext("IPv6 prefix length needed for IPv6 rapid deployment interface"));
			break;
		case "dslite":
			if(section.peeraddr.value == "")
				errors.push(gettext("DS-Lite AFTR address needed for DS lite interface"));
			break;
		case "l2tp":
			if(section.server.value == "")
				errors.push(gettext("L2TP server needed for PPP over L2TP"));
			if(section.username.value != "" && section.password.value == "")
				errors.push(gettext("Password needed when username is set"));
			break;
		default: 
			return gettext("Unsupported protocol: ") + section.proto.value;
	}
	if(errors.length > 0) return errors
	return null;
}); 

UCI.network.$registerSectionType("route", {
	"interface": 			{ dvalue: "", type: String }, 
	"target": 				{ dvalue: "", type: String, validator: UCI.validators.IPAddressValidator }, 
	"netmask": 				{ dvalue: "", type: String, validator: UCI.validators.IPAddressValidator }, 
	"gateway": 				{ dvalue: "", type: String, validator: UCI.validators.IPAddressValidator },
	"metric": 				{ dvalue: 0, type: Number },
	"mtu": 					{ dvalue: 1500, type: Number }
}); 

UCI.network.$registerSectionType("route6", {
	"interface": 			{ dvalue: "", type: String }, 
	"target": 				{ dvalue: "", type: String }, 
	"gateway": 				{ dvalue: "", type: String },
	"metric": 				{ dvalue: 0, type: Number },
	"mtu": 					{ dvalue: 1500, type: Number }
}); 

UCI.network.$registerSectionType("switch", {
	"name": 	{ dvalue: "", type: String },
	"reset":	{ dvalue: undefined, type: Boolean }, 
	"enable_vlan": { dvalue: true, type: Boolean },
	"enable": 	{ dvalue: false, type: Boolean }
}); 

UCI.network.$registerSectionType("switch_vlan", {
	"displayname": { dvalue: "", type: String },
	"vlan":		{ dvalue: 0, type: Number }, 
	"device": 	{ dvalue: "", type: String },
	"ports": 	{ dvalue: "", type: String }
}); 

UCI.network.$registerSectionType("switch_port_label", {
	"name": 	{ dvalue: "", type: String }, 
	"id": 		{ dvalue: undefined, type: Number }
}); 

UCI.network.$registerSectionType("switch_port", {
	"port": 	{ dvalue: 0, type: Number }, 
	"pvid": 	{ dvalue: 0, type: Number }
}); 

UCI.$registerConfig("hosts");
UCI.hosts.$registerSectionType("host", {
	"device":            { dvalue: "", type: String },
	"ipaddr":               { dvalue: "", type: String },
	"name":             { dvalue: "", type: String },
	"manufacturer":             { dvalue: "", type: String },
	"hostname":		{ dvalue: "", type: String, required: true}, 
	"macaddr":		{ dvalue: "", type: String, match: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, required: true}
});

UCI.juci.$registerSectionType("network", {
	"wan4_interface": 	{ dvalue: "wan", type: String }, // default wan4 interface name 
	"wan6_interface": 	{ dvalue: "wan6", type: String }, // default wan6 interface name 
	"voice_interface": 	{ dvalue: "wan", type: String }, 
	"iptv_interface": 	{ dvalue: "wan", type: String }
}); 
