# the $ethernet factory

This is an object for managing layer2 ethernet devices. This includes all
devices that are reported by "ip" command on linux and this includes ADSL,
VDSL, VLAN and various ethernet devices. This module does NOT manage ip level
settings though - that job should be left to the $network module. 

## functionality

	method: getAdapters - return: promise, callback(list:ethernet_adapter)
		
		returns list of all ethernet adapters that are configurable on the
		system. This includes adapters that are currently down or for some
		reason not currently present on the system. This function will query
		all available adapters through the ip command and then let all
		subsystems fill in their own details for each item in the list before
		returning the list. This is done by running the list through all
		registered layer2 subsystems which are configurable through the gui. 

	object: ethernet_adapter 
		
		This is a structure returned by the above method. 

		.name: identified name of the adapter. 
			for wireless adapters this could be the ssid. For ports this would
			be LAN1 or WAN etc. The name should be filled in by the subsystem
			responsible for managing the adapter. 
		
		.id: ethernet device name. 

		.subsystem: name of the subsystem managing the adapter. 

		.config: uci configuration for the given adapter. 
			This can point to subsystem specific configuration for the adapter. 
		
