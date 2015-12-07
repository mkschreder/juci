//! Author: Reidar Cederqivst <reidar.cederqvist@gmail.com>

UCI.$registerConfig("provisioning");
UCI.provisioning.$registerSectionType("general", {
	"enabled":		{ dvalue: 'on', type: Boolean },
	"starttime": 	{ dvalue: '', type: String },
	"interval":		{ dvalue: '', type: String }
});
UCI.provisioning.$registerSectionType("server", {
	"reboot":		{ dvalue: 'off', type: Boolean },
	"enabled":		{ dvalue: 'off', type: Boolean },
	"url":			{ dvalue: '', type: String },
	"deckey":		{ dvalue: '', type: String }
});
UCI.provisioning.$registerSectionType("software", {
	"enabled":		{ dvalue: 'off', type: Boolean },
	"defaultreset": { dvalue: 'off', type: Boolean },
	"url":			{ dvalue: '', type: String }
});
UCI.provisioning.$registerSectionType("subconfig", {
	"url":				{ dvalue: '', type: String },
	"packagecontrol":	{ dvalue: '', type: String },
	"enabled":			{ dvalue: 'off', type: Boolean }
});
			
