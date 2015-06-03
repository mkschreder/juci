/*JUCI.app
.config(function($stateProvider) {
	var plugin_root = $juci.module("internet").plugin_root; 
	$stateProvider.state("internet", {
		url: "/internet", 
		onEnter: function(){
			$juci.redirect("internet-firewall"); 
		}
	}); 
});*/

UCI.$registerConfig("network"); 
UCI.network.$registerSectionType("interface", {
	"is_lan":					{ dvalue: false, type: Boolean }, 
	"ifname":					{ dvalue: '', type: String }, 
	"proto":					{ dvalue: 'dhcp', type: String }, 
	"ipaddr":					{ dvalue: '', type: String }, 
	"netmask":				{ dvalue: '', type: String }, 
	"type":						{ dvalue: '', type: String }, 
	"ip6assign":			{ dvalue: 60, type: Number }, 
	"bridge_instance": { dvalue: false, type: Boolean }, 
	"vendorid":				{ dvalue: '', type: String }, 
	"hostname":				{ dvalue: '', type: String }, 
	"ipv6":						{ dvalue: false, type: Boolean },
	"peerdns": 				{ dvalue: false, type: String }, 
	"dns": 						{ dvalue: [], type: Array }
}); 

UCI.$registerConfig("dhcp"); 
UCI.dhcp.$registerSectionType("dnsmasq", {
	"domainneeded":		{ dvalue: true, type: Boolean },
	"boguspriv":		{ dvalue: true, type: Boolean },
	"localise_queries":	{ dvalue: true, type: Boolean },
	"rebind_protection":	{ dvalue: false, type: Boolean },
	"local":		{ dvalue: "/lan/", type: String, required: true},
	"domain":		{ dvalue: "lan", type: String, required: true},
	"expandhosts":		{ dvalue: true, type: Boolean },
	"authoritative":	{ dvalue: true, type: Boolean },
	"readethers":		{ dvalue: true, type: Boolean },
	"leasefile":		{ dvalue: "/tmp/dhcp.leases", type: String, required: true},
	"resolvfile":		{ dvalue: "/tmp/resolv.conf.auto", type: String, required: true}
});
UCI.dhcp.$registerSectionType("dhcp", {
	"interface":		{ dvalue: "lan", type: String, required: true},
	"start":		{ dvalue: 100, type: Number },
	"limit":		{ dvalue: 150, type: Number },
	"leasetime":		{ dvalue: "12h", type: String, required: true},
	"ignore":		{ dvalue: false, type: Boolean }
});
UCI.dhcp.$registerSectionType("domain", {
	"name":		{ dvalue: "", type: String, required: true},
	"ip":		{ dvalue: "", type: String, required: true}  // TODO: change to ip address
});
UCI.dhcp.$registerSectionType("host", {
	"name":		{ dvalue: "", type: String, required: false},
	"mac":		{ dvalue: "", type: String, required: true},
	"ip":		{ dvalue: "", type: String, required: true}  // TODO: change to ip address
}); 

UCI.$registerConfig("ddns");
UCI.ddns.$registerSectionType("service", {
    "enabled":              { dvalue: 0, type: Number },
    "interface":            { dvalue: "", type: String },
    "use_syslog":           { dvalue: 0, type: Number },
    "service_name":         { dvalue: "", type: String },
    "domain":               { dvalue: "", type: String },
    "username":             { dvalue: "", type: String },
    "password":             { dvalue: "", type: String }
});
			
