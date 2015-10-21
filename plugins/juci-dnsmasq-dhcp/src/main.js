//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

UCI.$registerConfig("dhcp"); 
UCI.dhcp.$registerSectionType("dnsmasq", {
	"domainneeded":		{ dvalue: true, type: Boolean },
	"boguspriv":		{ dvalue: true, type: Boolean },
	"localise_queries":	{ dvalue: true, type: Boolean },
	"rebind_protection":	{ dvalue: false, type: Boolean },
	"local":		{ dvalue: "", type: String, required: true},
	"domain":		{ dvalue: "", type: String, required: true},
	"expandhosts":		{ dvalue: true, type: Boolean },
	"authoritative":	{ dvalue: true, type: Boolean },
	"readethers":		{ dvalue: true, type: Boolean },
	"leasefile":		{ dvalue: "/tmp/dhcp.leases", type: String, required: true},
	"resolvfile":		{ dvalue: "/tmp/resolv.conf.auto", type: String, required: true}
});
UCI.dhcp.$registerSectionType("dhcp", {
	"interface":		{ dvalue: "", type: String, required: true},
	"start":		{ dvalue: 100, type: Number, validator: UCI.validators.NumberLimitValidator(1, 255) },
	"limit":		{ dvalue: 150, type: Number, validator: UCI.validators.NumberLimitValidator(1, 255) },
	"leasetime":		{ dvalue: "12h", type: String, required: true},
	"ignore":		{ dvalue: false, type: Boolean }
});
UCI.dhcp.$registerSectionType("domain", {
	"name":		{ dvalue: "", type: String, required: true},
	"ip":		{ dvalue: "", type: String, required: true, validator: UCI.validators.IPAddressValidator }  // TODO: change to ip address
});
UCI.dhcp.$registerSectionType("host", {
	"name":		{ dvalue: "", type: String, required: false},
	"dhcp":		{ dvalue: "", type: String, required: true},
	"network": { dvalue: "lan", type: String, required: true }, 
	"mac":		{ dvalue: "", type: String, required: true, validator: UCI.validators.MACAddressValidator },
	"ip":		{ dvalue: "", type: String, required: true, validator: UCI.validators.IPAddressValidator },  // TODO: change to ip address
	"duid": 	{ dvalue: "", type: String }, 
	"hostid": 	{ dvalue: "", type: String }
}); 
