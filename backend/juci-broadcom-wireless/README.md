JUCI Wireless Backend
=====================

This module provides realtime information about wireless clients and wireless devices. 

METHODS
-------

	juci.broadcom.wireless: 
		info - returns wireless information such as default wpa key. 
			{
				"defaults": {
					"wpa_key": ""
				}
			}
		radios - returns list of radios and their capabilities
			{
				"wl0": {
					"band": "a",
					"frequency": 5,
					"hwmodes": [
						"11a",
						"11n",
						"11ac"
					],
					"bwcaps": [
						20,
						40,
						80
					],
					"channels": [
						36,
						40,
						44,
						48
					]
				}
			}
		clients - returns list of connected clients
			{
				"clients": [
					{
						"macaddr": "D0:22:BE:DD:0D:F3",
						"wdev": "wl0"
					}
				]
			}
