//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
/*
 * juci - javascript universal client interface
 *
 * Project Author: Martin K. Schröder <mkschreder.uk@gmail.com>
 * 
 * Copyright (C) 2012-2013 Inteno Broadband Technology AB. All rights reserved.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA
 */
/*
JUCI.app.config(function($stateProvider) {
	$stateProvider.state("phone", {
		url: "/phone", 
		onEnter: function($state){
			$juci.redirect("phone-call-log"); 
		},
	}); 
}); */
	
// add the uci classes for voice client
UCI.$registerConfig("voice_client"); 
UCI.voice_client.$registerSectionType("brcm_line", {
	"extension": 			{ dvalue: '', type: String }, 
	"sip_account": 			{ dvalue: '', type: String }, 
	"noise":				{ dvalue: 0, type: Number }, 
	"vad":					{ dvalue: 0, type: Number }, 
	"txgain":				{ dvalue: 0, type: Number }, 
	"rxgain":				{ dvalue: 0, type: Number }, 
	"echo_cancel":			{ dvalue: true, type: Boolean }, 
	"callwaiting":			{ dvalue: false, type: Boolean }, 
	"clir":					{ dvalue: false, type: Boolean }, 
	"name":					{ dvalue: '', type: String }, 
	"instance":				{ dvalue: '', type: String }
}); 
UCI.voice_client.$registerSectionType("sip_service_provider",  {
	"name":					{ dvalue: "", type: String },
	"codec0":				{ dvalue: "alaw", type: String },  
	"codec1":				{ dvalue: "ulaw", type: String },       
	"codec2":				{ dvalue: "g729", type: String },   
	"codec3":				{ dvalue: "g726", type: String },
	"autoframing":			{ dvalue: false, type: Boolean },
	"cfim_on":				{ dvalue: "*21*", type: String },  
	"cfim_off":				{ dvalue: "#21#", type: String },
	"cfbs_on":				{ dvalue: "*61*", type: String }, 
	"cfbs_off":				{ dvalue: "#61#", type: String }, 
	"call_return":			{ dvalue: "*69", type: String },         
	"displayname":			{ dvalue: "", type: String },
	"redial":				{ dvalue: "*66", type: String },   
	"is_fax":				{ dvalue: false, type: Boolean },      
	"transport":			{ dvalue: "udp", type: String },
	"priority_ulaw":		{ dvalue: 0, type: Number },
	"priority_alaw":		{ dvalue: 0, type: Number }, 
	"priority_g729":		{ dvalue: 0, type: Number },  
	"priority_g723":		{ dvalue: 0, type: Number },
	"priority_g726":		{ dvalue: 0, type: Number },   
	"enabled":				{ dvalue: true, type: Boolean },
	"target":				{ dvalue: "direct", type: String },       
	"call_lines":			{ dvalue: "", type: String },
	"mailbox":				{ dvalue: "", type: String },     
	"call_filter":			{ dvalue: "", type: String },     
	"domain":				{ dvalue: "", type: String },      
	"user":					{ dvalue: "", type: String }, 
	"authuser":				{ dvalue: "", type: String }, 
	"displayname":			{ dvalue: "", type: String }, 
	"ptime_ulaw":			{ dvalue: 20, type: Number }, 
	"ptime_g726":			{ dvalue: 20, type: Number },     
	"ptime_g729":			{ dvalue: 20, type: Number }, 
	"ptime_alaw":			{ dvalue: 20, type: Number }, 
	"host":					{ dvalue: "", type: String },  
	"outboundproxy":		{ dvalue: "", type: String },
	"secret":				{ dvalue: "", type: String }
}); 
UCI.voice_client.$registerSectionType("call_filter", { 
	"name":							{ dvalue: "", type: String }, 
	"block_outgoing":		{ dvalue: true, type: Boolean }, 
	"block_incoming":		{ dvalue: true, type: Boolean }, 
	"block_foreign": 		{ dvalue: true, type: Boolean }, // outgoing foreign
	"block_special_rate": { dvalue: false, type: Boolean } // outgoing special rate
}); 
UCI.voice_client.$registerSectionType("call_filter_rule_outgoing", {
	"owner": 						{ dvalue: "", type: String }, 
	"enabled": 					{ dvalue: true, type: Boolean },
	"extension": 				{ dvalue: "", type: String }
}); 
UCI.voice_client.$registerSectionType("call_filter_rule_incoming", {
	"owner": 						{ dvalue: "", type: String }, 
	"enabled": 					{ dvalue: true, type: Boolean },
	"extension": 				{ dvalue: "", type: String }
}); 

UCI.voice_client.$registerSectionType("dialplan", {
	"custom_outgoing_enabled":	{ dvalue: false, type: Boolean },
	"custom_incoming_enabled":	{ dvalue: false, type: Boolean },
	"custom_hangup_enabled":	{ dvalue: false, type: Boolean },
	"all_ports_extension":		{ dvalue: "#123456", type: String},
	"test_audio_extension":		{ dvalue: "#123457", type: String},
	"test_echo_extension":		{ dvalue: "#123458", type: String},
	"record_message_extension":	{ dvalue: "#999999", type: String}
});
UCI.voice_client.$registerSectionType("sip_advanced", {
	"rtpstart":					{ dvalue: 10000, type: Number },
	"rtpend":					{ dvalue: 20000, type: Number },
	"dtmfmode":					{ dvalue: "rfc2833", type: String},
	"remotehold":				{ dvalue: "yes", type: Boolean },
	"contact_line_suffix":		{ dvalue: 1, type: Number },
	"registertimeoutbackoff":	{ dvalue: 512, type: Number },
	"registerattemptsbackoff":	{ dvalue: 0, type: Number },
	"register403timeout":		{ dvalue: 0, type: Number },
	"register503timeout":		{ dvalue: 0, type: Number },
	"registertimeoutguardsecs":	{ dvalue: 15, type: Number },
	"registertimeoutguardlimit":{ dvalue: 30, type: Number },
	"registertimeoutguardpct":	{ dvalue: "0.2", type: String},
	"defaultexpiry":			{ dvalue: 300, type: Number },
	"tls_version":				{ dvalue: "tlsv1", type: String},
	"tls_cipher":				{ dvalue: "'DES-CBC3-SHA", type: String},
	"dnsmgr":					{ dvalue: "no", type: Boolean},
	"dnsmgr_refresh_interval":	{ dvalue: 300, type: Number },
	"srvlookup":				{ dvalue: "yes", type: Boolean},
	"sip_proxy":				{ dvalue: [], type: Array },
	"bindintf":					{ dvalue: "", type: String },
	"bindport":					{ type: Number },
	"useragent":				{ dvalue: "", type: String },
	"realm":					{ dvalue: "", type: String },
	"localnet":					{ dvalue: [], type: Array },
	"registertimeout":			{ type: Number },
	"registerattempts":			{ type: Number },
	"contact_line_suffix":		{ dvalue: false, type: Boolean },
	"tos_sip":					{ dvalue: "", type: String },
	"tos_audio":				{ dvalue: "", type: String },
	"congestiontone":			{ dvalue: "congestion", type: String },
	"stun_server":				{ dvalue: "", type: String }
});
UCI.voice_client.$registerSectionType("brcm_advanced", {
	"country":		{ dvalue: "SWE", type: String },
	"jbenable":		{ dvalue: "yes", type: Boolean },
	"jbforce":		{ dvalue: "no", type: Boolean },
	"jbmaxsize":	{ dvalue: 500, type: Number },
	"jbimpl":		{ dvalue: "adaptive", type: String },
	"genericplc":	{ dvalue: "yes", type: Boolean },
	"dialoutmsec":	{ dvalue: 4000, type: Number },
	"cw_enable":	{ dvalue: "yes", type: Boolean }
});
UCI.voice_client.$registerSectionType("features", {
	"cbbs_enabled":		{ dvalue: true, type: Boolean },
	"callforward_enabled":	{ dvalue: true, type: Boolean },
	"redial_enabled":	{ dvalue: true, type: Boolean },
	"callreturn_enabled":	{ dvalue: true, type: Boolean },
	"advanced_register_settings":	{ dvalue: true, type: Boolean }
}); 
UCI.voice_client.$registerSectionType("log", {
	"console":		{ dvalue: "notice,warning,error", type: String },
	"messages":		{ dvalue: "error", type: String },
	"syslog_facility":	{ dvalue: "local0", type: String }
}); 
UCI.voice_client.$registerSectionType("speed_dial", {
	"tone":		{ dvalue: 1, type: Number },
	"number":	{ dvalue: "", type: String }
}); 

UCI.voice_client.$registerSectionType("ringing_status", {
	"enabled": { dvalue: false, type: Boolean }, 
	"status": { dvalue: false, type: Boolean }
}); 

UCI.voice_client.$registerSectionType("ringing_schedule", {
	"days":		{ dvalue: [], type: Array, allow: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], validator: UCI.validators.WeekDayListValidator},
	"time":		{ dvalue: "", type: String, validator: UCI.validators.TimespanValidator}, 
	"sip_service_provider": { dvalue: "", type: String }
}); 
UCI.voice_client.$registerSectionType("mailbox", {
	"user":			{ dvalue: "", type: String },
	"name":			{ dvalue: "", type: String },
	"boxnumber":	{ dvalue: "", type: String },
	"pin":			{ type: Number },
	"enabled":		{ dvalue: false, type: Boolean }
});
