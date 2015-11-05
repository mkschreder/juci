//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app.requires.push("angularBootstrapNavTree"); 
JUCI.app.requires.push("isteven-multi-select");

JUCI.app
.factory("$minidlna", function($uci){
	function MiniDLNA(){
		
	}
	
	MiniDLNA.prototype.getConfig = function(){
		var deferred = $.Deferred(); 
		$uci.$sync("minidlna").done(function(){
			deferred.resolve($uci.minidlna.config); 
		}); 
		return deferred.promise(); 
	}
	return new MiniDLNA(); 
}); 


UCI.$registerConfig("minidlna");
UCI.minidlna.$registerSectionType("minidlna", {
	"enabled":          { dvalue: 0, type: Number },
	"port":         		{ dvalue: "", type: String },
	"interface":        { dvalue: "", type: String },
	"friendly_name":    { dvalue: "", type: String },
	"db_dir":         	{ dvalue: "", type: String },
	"log_dir":         	{ dvalue: "", type: String },
	"inotify":         	{ dvalue: false, type: Boolean },
	"enable_tivo":      { dvalue: true, type: Boolean },
	"strict_dlna":      { dvalue: false, type: Boolean },
	"presentation_url": { dvalue: "", type: String },
	"notify_interval":  { dvalue: 900, type: Number },
	"serial":         	{ dvalue: "", type: String },
	"model_number":			{ dvalue: "", type: String },
	"root_container":		{ dvalue: "", type: String },
	"media_dir":				{ dvalue: [], type: Array },
	"album_art_names":	{ dvalue: "", type: String },
	"network":			{ dvalue: "lan", type: String }
});
			
