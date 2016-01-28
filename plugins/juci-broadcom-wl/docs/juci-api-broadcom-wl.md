JUCI Broadcom Wireless Backend
------------------------------

	/juci/wireless devices -> {}
	----------------------------

	Returns list of wireless virtual devices (one per SSID) on the system. 

	Example: 
	{
        "devices": [
			{
				"device": "wl0",
				"ssid": "Inteno-B94D",
				"mode": "Managed",
				"rssi": 0,
				"snr": 0,
				"noise": -92,
				"channel": 106,
				"bssid": "00:22:07:42:06:2E",
				"rates": "6(b),9,12(b),18,24(b),36,48,54",
				"frequency": "5GHz",
				"primary_channel": 100,
				"supported_channels": "87-88"
			}
		]
	} 
	
	/juci/wireless clients -> {}
	----------------------------

	Returns list of currently connected wireless clients. 

	Example: 
	{
        "clients": [
			{
				"macaddr": "5C:C5:A4:C0:44:55",
				"device": "wl1",
				"band": "2.4GHz",
				"flags": "AUTHED,UP",
				"rssi": -31,
				"noise": -89,
				"hostname": "johndoe-123",
				"ipaddr": "192.168.1.100"
			}
        ]
	}
	
	/juci/wireless radios -> {}
	---------------------------

	Returns list of physical radios and their parameters
	
	Example: 
	{
        "wl0": {
			"hwmodes": [
				"11ac",
				"auto",
				"11a",
				"11n"
			],
			"bwcaps": [
				20,
				40,
				80
			],
			"channels": [
				"auto",
				36,
				40,
				44,
				48,
			],
			"frequency": "5GHz"
		}
	}

	/juci/wireless defaults -> {}
	-----------------------------
		
	Returns default wpa key from factory. This should never return current wpa
	key. It should return values that have been set by manufacturer and which are
	usually printed on the box.  

	Example: 
	{
		"keys": {
			"wpa": "1234567890"
		}
	}
	
	/juci/wireless scan -> {"device":"<dev>"}
	-----------------------------------------

	Starts a scan on a specific wireless device. Scan usually takes a few
	seconds. Scan results should be polled using scanresults method. 
	
	Returns empty object. 
		
	/juci/wireless scanresults -> {"device":"<dev>"}
	------------------------------------------------
	
	Returns list of active access points discovered during a scan as reported
	by the wireless driver. 
	
	{ 
		"access_points":[
			{
				"multicast_cipher": "TKIP",
				"ssid": "SSID-0DC6",
				"cipher": "WPA2-PSK",
				"bssid": "00:22:07:4F:0D:C5",
				"wps_version": "V2.0",
				"channel": "11",
				"primary_channel": "11",
				"mode": "Managed",
				"rssi": "-51",
				"frequency": "2.4GHz"
			}
		]
	}

JUCI Broadcom WPS Backend
-------------------------

	/juci/wireless.wps status -> {}
	--------------------------------

	Returns wps status. 

	Example: 
	{
		"code": 0,
		"status": "init"
	}
	
	/juci/wireless.wps pbc -> {}
	----------------------------

	Initiates a push button wps pairing procedure. 

	Returns empty object. 

	/juci/wireless.wps genpin -> {}
	-------------------------------
	
	Generates a new wps pin and returns it. 

	Example: 
	{ 
		"pin": "1123123"
	}

	/juci/wireless.wps checkpin -> {"pin":"<somepin>"}
	---------------------------------
	
	Checks if the supplied pin is valid. 
	
	Returns valid true or false. 

	Example: 
	{ 
		"valid": true
	}

	/juci/wireless.wps stapin -> {"pin":"<staion pin>"}
	---------------------------------------------------

	Set pin for external pin wps function. 

	Returns the pin. 
	{
		"pin":"<pin>"
	}

	/juci/wireless.wps showpin -> {}
	--------------------------------

	Returns current wps pin. 

	Example: 
	{
		"pin": "123123"
	}

	/juci/wireless.wps stop -> {}
	-----------------------------

	Stop wps_monitor service. 
	
