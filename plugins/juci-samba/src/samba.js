//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.factory("$samba", function($uci){
	function Samba () {}
	Samba.prototype.getConfig = function(){
		var def = $.Deferred(); 
		$uci.$sync("samba").done(function(){
			if(!$uci.samba["@samba"].length) def.reject(); 
			else def.resolve($uci.samba["@samba"][0]); 
		}).fail(function(){
			def.reject();
		});  
		return def.promise(); 
	}
	Samba.prototype.getShares = function(){
		var def = $.Deferred(); 
		$uci.$sync("samba").done(function(){
			def.resolve($uci.samba["@sambashare"]); 
		}).fail(function(){
			def.reject();
		}); 
		return def.promise();  
	}
	
	return new Samba(); 
}); 

UCI.$registerConfig("samba"); 
UCI.samba.$registerSectionType("samba", {
	"name":			{ dvalue: "", type: String }, 
	"workgroup":	{ dvalue: "", type: String },
	"description":	{ dvalue: "", type: String },
	"charset": 		{ dvalue: "", type: String },
	"homes":		{ dvalue: false, type: Boolean }
}); 

UCI.samba.$registerSectionType("sambashare", {
	"name":			{ dvalue: "", type: String }, 
	"path":			{ dvalue: "/mnt", type: String },
	"users":		{ dvalue: "", type: String }, // comma separated list
	"read_only":	{ dvalue: "", type: String }, // Yes/no
	"guest_ok":		{ dvalue: "", type: String }, // Yes/no
	"create_mask":	{ dvalue: "0700", type: String }, 
	"dir_mask":		{ dvalue: "0700", type: String } 
}); 

UCI.samba.$registerSectionType("sambausers", {
	"user":		{ dvalue: "", type: String }, 
	"password":		{ dvalue: "", type: String }
}); 
