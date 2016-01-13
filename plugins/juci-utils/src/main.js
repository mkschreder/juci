//! Author: Reidar Cederqvst <reidar.cederqvist@gmail.com>

UCI.$registerConfig("speedtest"); 
UCI.speedtest.$registerSectionType("testserver", {
	"server":		{ dvalue: "", type: String }, 
	"port":			{ dvalue: "", type: String }, 
});

