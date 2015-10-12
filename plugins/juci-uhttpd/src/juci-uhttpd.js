//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

UCI.$registerConfig("uhttpd"); 
UCI.uhttpd.$registerSectionType("uhttpd", {
	"home":				{ dvalue: "/www", type: String }, 
	"max_requests":		{ dvalue: false, type: Number }, 
	"max_connections":	{ dvalue: false, type: Number }, 
	"ubus_prefix":		{ dvalue: true, type: String } 
}); 

