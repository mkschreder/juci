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

UCI.$registerConfig("ntra"); 
UCI.ntra.$registerSectionType("ntra", {
	"enabled": 	{ dvalue: true, type: Boolean }, 
	"protocol": { dvalue: "http", type: String }, 
	"remote_ip":{ dvalue: "", type: String, validator: UCI.validators.IP4AddressValidator }, 
	"remote_port": { dvalue: 80, type: Number, validator: UCI.validators.PortValidator },
	"local_interface": { dvalue: "wan", type: String }, 
	"local_port": { dvalue: 8888, type: Number, validator: UCI.validators.PortValidator }, 
	"restrict_source": { dvalue: "", type: String, validator: UCI.validators.IP4CIDRValidator }
}, function(section){
	if(section.remote_ip.value == "") return gettext("Remote IP address can not be empty!"); 
	if(section.protocol.value == "") return gettext("Protocol can not be empty!"); 
	if(section.local_interface.value == "") return gettext("Local interface can not be empty!"); 
	return null; 
}); 

