NETIFD NETWORK MONITOR
======================

This plugin includes two services: 

* juci-netdevd - which monitors new devices that get plugged into the system (basically listens for hotplug events) 
* juci-netmond - which listens for clients connecting to the box and montoring their status. 

Events that each service emits when it is running are described in detail below: 

NETDEVD EVENTS
--------------

* juci.netdevd.dongle.up - currently fired when a network device called wwanX or usbX is plugged in. Data is as follows: 
* juci.netdevd.dongle.configured - fired when a dongle that was identifed as being up has also been autoconfigued with multiwan and such. 

Device events are accompanied with data that has following format: 

* `device`: the name of the device

NETMOND EVENTS
--------------

* juci.netmond.client.up - fired when a client comes up on the network. Netmond will regularly ping the client and make sure it is online. 
* juci.netmond.client.down - fired when a client goes down or can not be reached anymore. 

Client events have data that has the same format as output of /juci/network clients ubus call. Currently these fields will be available: 

* `ipaddr`: ip address of the device 
* `ip6status`: either REACHABLE or STALE or other status. Same format as ip -6 neigh format. 
* `ip6hostid`: this is the hostid as currently reported by openwrt odhcpd
* `leasetime`: dhcp leasetime remaining (if available) 
* `ip6addr`: ipv6 address of the client (if available) 
* `ip6duid`: ipv6 duid number (if client has a dhcpv6 lease) 
* `macaddr`: mac address of the client. 
* `hostname`: hostname of the client
* `device`: device to which this client is currently connected. This can be for example br-lan if client is connected to bridge. 	
