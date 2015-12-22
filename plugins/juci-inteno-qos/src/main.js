/*	
	This file is part of JUCI (https://github.com/mkschreder/juci.git)

	Copyright (c) 2015 Reidar Cederqvist <reidar.cederqvist@gmail.com>

	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
*/ 

UCI.$registerConfig("qos");
UCI.qos.$registerSectionType("classify", {
	"target":	{ dvalue:'Normal', type: String },
	"ports":	{ dvalue: '', type: String },
	"comment":	{ dvalue: '', type: String },
	"dscp":		{ dvalue: '', type: String },
	"srchost":	{ dvalue: '', type: String, validator: UCI.validators.IPAddressValidator },
	"dsthost":	{ dvalue: '', type: String, validator: UCI.validators.IPAddressValidator },
	"proto":	{ dvalue: '', type: String }
});
UCI.qos.$registerSectionType("classgroup", {
	"classes":	{ dvalue: 'Priority Express Normal Bulk', type: String },
	"default": 	{ dvalue: 'Normal', type: String }
});

JUCI.app.factory("intenoQos", function($uci){
	function Qos(){ }
	Qos.prototype.getDefaultTargets = function(){
		var def = $.Deferred(); 
		$uci.$sync(["qos"]).done(function(){
			var targets = []; 
			if($uci.qos.Default){
				targets = $uci.qos.Default.classes.value.split(" ").map(function(x){
					//if(x == "Bulk") return { label: $tr(gettext("Low")), value: x };
					return x; 
				});
			}
			def.resolve(targets); 
		}).fail(function(){ def.reject(); });
		return def.promise(); 
	} 

	return new Qos(); 
}); 
