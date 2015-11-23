//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

UCI.$registerConfig("backup");
UCI.backup.$registerSectionType("service", {
	"desc":	{ dvalue:'', type: String },
	"user":	{ dvalue: false, type: Boolean },
	"keep": { dvalue: true, type: Boolean }
})
