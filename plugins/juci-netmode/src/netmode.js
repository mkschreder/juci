//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.factory("$netmode", function($uci, $rpc){
	var sync_netmode = $uci.$sync("netmode"); 
	
	function Netmode (){
		
	}
	
	Netmode.prototype.list = function(){
		var def = $.Deferred(); 
		sync_netmode.done(function(){
			if($uci.netmode && $uci.netmode["@netmode"]){
				def.resolve($uci.netmode["@netmode"]); 
			} else {
				def.reject(); 
			}
		}); 
		return def.promise(); 
	}
	
	Netmode.prototype.select = function(mode){
		var def = $.Deferred(); 
		if(!$rpc.juci.netmode || !$rpc.juci.netmode.select) {
			def.reject(); 
			return def.promise(); 
		}
		$rpc.juci.netmode.select({ "netmode": mode }).done(function(){
			def.resolve(); 
		}).fail(function(){
			def.reject(); 
		}); 
		
		return def.promise(); 
	}
	
	
	Netmode.prototype.getCurrentMode = function(){
		var def = $.Deferred(); 
		// currently use the setting from uci. But we want to actually compare the files eventually. 
		sync_netmode.done(function(){
			setTimeout(function(){
				if($uci.netmode && $uci.netmode.setup){
					def.resolve($uci.netmode[$uci.netmode.setup.curmode.value]); 
				} else {
					def.reject(); 
				}
			},0); 
		});
		return def.promise(); 
	}
	
	return new Netmode(); 
}); 

JUCI.app.run(function($uci){
	// automatically create the setup section because without it we can not get current netmode (it should actually be there by default, but just in case);
	$uci.$sync("netmode").done(function(){
		$uci.netmode.$create({".type": "mode", ".name": "setup" }).done(function(){
			$uci.$save(); 
		}); 
	}); 
}); 

UCI.$registerConfig("netmode"); 
UCI.netmode.$registerSectionType("mode", {
	"dir":						{ dvalue: '', type: String }, 
	"detail":					{ dvalue: '', type: String }, 
	"curmode":				{ dvalue: '', type: String }
}); 
UCI.netmode.$registerSectionType("netmode", {
	"name":						{ dvalue: '', type: String }, 
	"desc":						{ dvalue: '', type: String }, 
	"conf":					{ dvalue: '', type: String }, 
	"exp":				{ dvalue: '', type: String }
}); 

// temporarily here just for convenience. We should use a static set of predefined modes and then use static titles that can be localized for each language. Using dynamic uci strings that need to be translated is tricky at best. 
angular.module('gettext').run(['gettextCatalog', function (gettextCatalog) { gettextCatalog.setStrings('fi',{"This configuration bridges LAN4 port":"Tämä profiili siltaa LAN4 portin","Default routed configuration with IPv6 and IPv4":"Oletusprofiili IPv4 ja IPv6 reitittävä","Routed configuration with IPv4 only":"Reitittävä profiili. Vain IPv4 käytössä","Bridged mode changes your modem to bridged":"Sillattu profiili siltaa modeemin","Routed+3G changes your modem to use 3G connection as backup WAN. Please check your 3G dongle meets DNA requirements like model, apn and PIN":"Reitittävä 3G varayhteys-profiili mahdollistaa 3G varayhteyden. Tarkista, että käytettävä mokkula tukee DNA:n vaatimuksia kuten malli, APN ja PIN","Routed+4G changes your modem to use 4G(LTE) connection as backup WAN. Please check your 4G(LTE) dongle meets DNA requirements like model, apn and PIN":"Reitittävä 4G varayhteys-profiili mahdollistaa 4G varayhteyden. Tarkista, että käytettävä mokkula tukee DNA:n vaatimuksia kuten malli, APN ja PIN","This configuration bridges LAN4 port and turns WLAN off":"Tämä profiili siltaa LAN4 portin ja sammuttaa WiFin","Routed":"Reitittävä","Routed IPv4 only":"Reitittävä IPv4","Bridged":"Sillattu","Routed 3G backup":"Reitittävä 3G varayhteys","Routed 4G backup":"Reitittävä 4G varayhteys","Bridged LAN4":"Sillattu LAN4","Bridged LAN4, Wifi Off":"Sillattu LAN4, WiFi Off"});}]);
angular.module('gettext').run(['gettextCatalog', function (gettextCatalog) { gettextCatalog.setStrings('sv-SE',{"This configuration bridges LAN4 port":"Denhär konfigurationen bryggar port LAN4","Default routed configuration with IPv6 and IPv4":"Standard IPv4 och IPv6 routed konfiguration","Routed configuration with IPv4 only":"Routed konfiguration med bara IPv4","Bridged mode changes your modem to bridged":"Bridge mode ändrar ditt modem till bryggad trafik","Routed+3G changes your modem to use 3G connection as backup WAN. Please check your 3G dongle meets DNA requirements like model, apn and PIN":"Routed+3G ändrar ditt modem till att använda 3g koppling som reserv WAN uppkoppling. Kontrollera att din 3G sticka uppfyller DNAs krav på model, APN och PIN","Routed+4G changes your modem to use 4G(LTE) connection as backup WAN. Please check your 4G(LTE) dongle meets DNA requirements like model, apn and PIN":"Routed+4G ändrar ditt modem till att använda 3g koppling som reserv WAN uppkoppling. Kontrollera att din 4G (LTE) sticka uppfyller DNAs krav på model, APN och PIN","This configuration bridges LAN4 port and turns WLAN off":"Denhär konfigurationen bryggar port LAN4 och stänger av WLAN (WiFi)","Routed":"Routad","Routed IPv4 only":"Enbar IPv4 routad","Bridged":"Bryggad","Routed 3G backup":"Routad 3G reservförbindelse","Routed 4G backup":"Routad 4G reservförbindelse","Bridged LAN4":"Bryggad LAN4","Bridged LAN4, Wifi Off":"Bryggad LAN4, WiFi anstängd"});}]);
