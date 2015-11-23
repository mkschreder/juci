//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

UCI.$registerConfig("power_mgmt");
UCI.power_mgmt.$registerSectionType("power_mgmt", {
	"cpur4kwait":	{ dvalue: false, type: Boolean },
	"sr":			{ dvalue: false, type: Boolean },
	"ethapd":		{ dvalue: false, type: Boolean },
	"eee":			{ dvalue: false, type: Boolean },
	"cpuspeed":		{ dvalue: 0, type: Number }
});
			
