# the $network factory

This service is responsible for managing network layer that works on top of
ethernet layer. This includes keeping track of clients that are identifiable on
the network and managing actual network connections. Note that there can be
multiple network connections on a single ethernet adapter - such as cases where
you have multiple ip addresses on a single ethernet interface. The network
module is responsible for the protocol part of the picture.

## functionality

	function: getClients return:promise, callback(list:network_client)

		this function gets the list of clients that are currently identifiable
		on the network. Usually this is done using arp or wireless assoc list.
		The central point for getting the list of clients is the arp table.
		Once the system has the arp table, it will filter it through each
		registered subsystem (such as wireless or 3g modem managers or dhcp)
		which will fill in more details about the client. Thus the basic info
		is merely an IP address and MAC address - but more information can be
		queried through plugin modules that register themselves with the
		network subsystem. 

	
