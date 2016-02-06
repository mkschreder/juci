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

UCI.$registerConfig("mcpd"); 
UCI.mcpd.$registerSectionType("mcpd", {
	"igmp_proxy_interfaces": 			{ dvalue: "", type: String }, 
	"igmp_default_version": 			{ type: Number }, 
	"igmp_query_interval": 				{ type: Number },
	"igmp_query_response_interval":		{ type: Number },
	"igmp_last_member_query_interval":	{ type: Number },
	"igmp_robustness_value":			{ type: Number },
	"igmp_max_groups":					{ type: Number },
	"igmp_max_sources":					{ type: Number },
	"igmp_max_members":					{ type: Number },
	"igmp_fast_leave":					{ type: Boolean },
	"igmp_proxy_enable":				{ type: Number },
	"igmp_snooping_enable":				{ type: Number },
	"igmp_snooping_interfaces":			{ dvalue: "", type: String },
	"igmp_dscp_mark":					{ dvalue: "", type: String },
	"igmp_lan_to_lan_multicast":		{ type: Boolean },
	"igmp_join_immediate":				{ type: Boolean }
});
