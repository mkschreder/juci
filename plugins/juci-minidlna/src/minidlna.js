/*	
	This file is part of JUCI (https://github.com/mkschreder/juci.git)

	Copyright (c) 2015 Martin K. Schröder <mkschreder.uk@gmail.com>

	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
*/ 

JUCI.app.requires.push("angularBootstrapNavTree"); 
JUCI.app.requires.push("dropdown-multi-select");

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
	"port":         	{ dvalue: "", type: String },
	"interface":        { dvalue: "", type: String },
	"friendly_name":    { dvalue: "", type: String },
	"db_dir":         	{ dvalue: "/var/run/minidlna", type: String },
	"log_dir":         	{ dvalue: "/var/log", type: String },
	"inotify":         	{ dvalue: false, type: Boolean },
	"enable_tivo":      { dvalue: true, type: Boolean },
	"strict_dlna":      { dvalue: false, type: Boolean },
	"presentation_url": { dvalue: "", type: String },
	"notify_interval":  { dvalue: 900, type: Number },
	"serial":         	{ dvalue: "12345678", type: String },
	"model_number":		{ dvalue: "1", type: String },
	"root_container":	{ dvalue: "", type: String },
	"media_dir":		{ dvalue: [], type: Array },
	"album_art_names":	{ dvalue: "", type: String },
	"network":			{ dvalue: "lan", type: String },
	"minissdpsocket":	{ dvalue: "", type: String }
});
			
