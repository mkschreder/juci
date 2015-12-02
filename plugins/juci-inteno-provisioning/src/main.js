//! Author: Reidar Cederqivst <reidar.cederqvist@gmail.com>

UCI.$registerConfig("provisioning");
UCI.provisioning.$registerSectionType("general", {
	"enabled":		{ dvalue: '', type: String },
	"starttime": 	{ dvalue: '', type: String },
	"interval":		{ dvalue: '', type: String }
});
UCI.provisioning.$registerSectionType("server", {
	"reboot":		{ dvalue: '', type: String },
	"enabled":		{ dvalue: '', type: String },
	"url":			{ dvalue: '', type: String },
	"deckey":		{ dvalue: '', type: String }
});
UCI.provisioning.$registerSectionType("software", {
	"enabled":		{ dvalue: '', type: String },
	"defaultreset": { dvalue: '', type: String },
	"url":			{ dvalue: '', type: String }
});
UCI.provisioning.$registerSectionType("subconfig", {
	"url":				{ dvalue: '', type: String },
	"packagecontrol":	{ dvalue: '', type: String },
	"enabled":			{ dvalue: '', type: String }
});
			
