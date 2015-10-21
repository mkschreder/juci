JUCI NETIFD PLUGIN
==================

This plugin for juci proveds services for configuring and monitoring network interfaces that are managed primarily through netifd on openwrt. 

SERVICES
========

* `$network` - used by other plugins to get network status, query configuration and get information about clients connected to the network. 

WIDGETS
=======

* `bridge-device-picker` - used to pick a network device to be added to a bridge. Will only include bridgeable devices. 
* `network-client-lan-display-widget` - a widget that will be used to display wired network clients info in the overview widget for network. 
