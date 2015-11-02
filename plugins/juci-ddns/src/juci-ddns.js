//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

UCI.$registerConfig("ddns");
UCI.ddns.$registerSectionType("service", {
	"enabled":              { dvalue: false, type: Boolean },
	"interface":            { dvalue: "", type: String },
	"use_syslog":           { dvalue: false, type: Boolean },
	"service_name":         { dvalue: "", type: String },
	"domain":               { dvalue: "", type: String },
	"username":             { dvalue: "", type: String },
	"password":             { dvalue: "", type: String },
	"use_https": 			{ dvalue: false, type: Boolean },
	"force_interval": 		{ dvalue: 72, type: Number }, 
	"force_unit": 			{ dvalue: "hours", type: String },
	"check_interval": 		{ dvalue: 10, type: Number },
	"check_unit": 			{ dvalue: "minutes", type: String }, 
	"retry_interval": 		{ dvalue: 60, type: Number },
	"retry_unit":			{ dvalue: "seconds", type: String },
	"ip_source": 			{ dvalue: "interface", type: String },
	"ip_network": 			{ dvalue: "", type: String },
	"ip_script": 			{ dvalue: "", type: String },
	"ip_url": 				{ dvalue: "", type: String },
	"update_url": 			{ dvalue: "", type: String }
});
