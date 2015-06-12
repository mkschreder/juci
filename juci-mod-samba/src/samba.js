(function(){
	UCI.$registerConfig("samba"); 
	UCI.samba.$registerSectionType("samba", {
		"name":		{ dvalue: "", type: String }, 
		"workgroup":		{ dvalue: "", type: String },
		"description":	{ dvalue: "", type: String },
		"homes":	{ dvalue: 1, type: Number }
	}); 
	UCI.samba.$registerSectionType("sambashare", {
		"create_mask":		{ dvalue: "0700", type: String }, 
		"dir_mask":		{ dvalue: "0700", type: String }, 
		"name":		{ dvalue: "", type: String }, 
		"users":		{ dvalue: [], type: Array }, 
		"guest_ok":		{ dvalue: "no", type: String }, 
		"read_only":		{ dvalue: "", type: String }, 
		"path":		{ dvalue: "/mnt", type: String }
	}); 
	UCI.samba.$registerSectionType("sambausers", {
		"user":		{ dvalue: "", type: String }, 
		"password":		{ dvalue: "", type: String }
	}); 
})(); 
