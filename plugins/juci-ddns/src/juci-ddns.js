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
