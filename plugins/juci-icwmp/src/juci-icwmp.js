//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

UCI.$registerConfig("cwmp");
UCI.cwmp.$registerSectionType("cwmp", {
	"url":						{ dvalue: '', type: String },
	"userid":					{ dvalue: '', type: String },
	"passwd":					{ dvalue: '', type: String },
	"periodic_inform_enable":	{ dvalue: true, type: Boolean },
	"periodic_inform_interval":	{ dvalue: 1800, type: Number },
	"periodic_inform_time":		{ dvalue: 0, type: Number },
	"dhcp_discovery":			{ dvalue: 'enable', type: String },
	"default_wan_interface":	{ dvalue: '', type: String },
	"log_to_console":			{ dvalue: 'disable', type: String },
	"log_to_file":				{ dvalue: 'enable', type: String },
	"log_severity":				{ dvalue: 'INFO', type: String },
	"log_max_size":				{ dvalue: 102400, type: Number },
	"port":						{ dvalue: 7547, type: Number },
	"provisioning_code":		{ dvalue: '', type: String }
});
