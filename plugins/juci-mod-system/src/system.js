//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

UCI.$registerConfig("system"); 

UCI.system.$registerSectionType("system", {
	"timezone":		{ dvalue: '', type: String },
	"zonename":		{ dvalue: '', type: String },
	"conloglevel":		{ dvalue: 0, type: Number },
	"cronloglevel":		{ dvalue: 0, type: Number },
	"hostname":		{ dvalue: '', type: String },
	"displayname":		{ dvalue: '', type: String },
	"log_size":		{ dvalue: 200, type: Number }
}); 

UCI.system.$registerSectionType("timeserver", {
	"enable_server": { dvalue: false, type: Boolean }, 
	"server": { dvalue: [], type: Array }
}); 

UCI.system.$registerSectionType("upgrade", {
	"fw_check_url":		{ dvalue: "", type: String, required: false},
	"fw_path_url":		{ dvalue: "", type: String },
	"fw_usb_path": 		{ dvalue: "", type: String }, 
	"fw_find_ext":		{ dvalue: "", type: String, required: false},
	"fw_upload_path":	{ dvalue: "", type: String, required: false}
}); 
