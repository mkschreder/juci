//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

UCI.$registerConfig("dropbear"); 
UCI.dropbear.$registerSectionType("settings", {
	"enable": 					{ dvalue: true, type: Boolean }, //Set to 0 to disable starting dropbear at system boot.
	"verbose": 					{ dvalue: false, type: Boolean }, //Set to 1 to enable verbose output by the start script.
	"BannerFile": 			{ dvalue: "", type: String} , //Name of a file to be printed before the user has authenticated successfully.
	"PasswordAuth": 		{ dvalue: true, type: Boolean }, //Set to 0 to disable authenticating with passwords.
	"Port": 						{ dvalue: 22, type: Number }, //Port number to listen on.
	"RootPasswordAuth": { dvalue: true, type: Boolean }, //Set to 0 to disable authenticating as root with passwords.
	"RootLogin": 				{ dvalue: true, type: Boolean }, //Set to 0 to disable SSH logins as root.
	"GatewayPorts": 		{ dvalue: false, type: Boolean }, //Set to 1 to allow remote hosts to connect to forwarded ports.
	"Interface": 				{ dvalue: "", type: String }, //Tells dropbear to listen only on the specified interface.1)
	"rsakeyfile": 			{ dvalue: "", type: String }, //Path to RSA file
	"dsskeyfile": 			{ dvalue: "", type: String }, //Path to DSS/DSA file
	"SSHKeepAlive": 		{ dvalue: 300, type: Number }, //Keep Alive
	"IdleTimeout": 			{ dvalue: 0, type: Number } //Idle Timeout 
}); 
