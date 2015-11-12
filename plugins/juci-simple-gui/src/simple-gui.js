//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

UCI.juci.$registerSectionType("simplegui", {
	"lan_network": 		{ dvalue: "lan", type: String }, 
	"wan_network": 		{ dvalue: "wan", type: String }, 
	"2g_radio": 		{ dvalue: "", type: String }, 
	"5g_radio": 		{ dvalue: "", type: String }
}); 
UCI.juci.$insertDefaults("simplegui"); 
