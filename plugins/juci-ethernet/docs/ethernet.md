JUCI Ethernet Subsystem
=========

This module is the core ethernet subsytem that ties together any other plugins that manage ethernet devices of some kind. It allows the user to have a standard interface for querying ethernet adapters. For example if you have a plugin for configuring vendor specific wireless settings then you would register that plugin as a subsystem of $ethernet and you will then be able to provide your vendor specific data as part of the list of adapters as it is returned by `getAdapters` method. 

This plugin gets most of it's information from the ip(8) command and so it will always return a list of all adapters that the system knows about. However, things like adapter names and proper presentation of adapters is usually specific to the vendor. For example, you could have an ethernet port that is tied to an ethernet port with label LAN2 printed on the box. In this case this information will be probably provided by some board specific configuration file where you specifically assign interface names to the actual port numbers which are printed on the cover of the box. This is where subsystems come to resque because they allow you to implement your vendor speciffic package separately and then to annotate the existing list of adapters inside your callback which you register with the $ethernet subsystem. 

METHODS
=======

These are methods provided by the `$ethernet` factory when you add it to your parameter list to you page or widget controller. 

`addSubsystem(subsys)` -> void
		
	adds a new subsystem to list of subsystems. subsys can implement
	annotateAdapters(adapter:list) to modify the list of ethernet adapters
	before it will be returned to the user. 

`getAdapters()` -> promise
		
	returns the list of ethernet adapters currently present on the system
	(both adapters that are actually present and the ones that are
	configured but may not yet be up).
	
EXPECTED SUBSYSTEM INTERFACE
=======

These are methods that a subsystem would provide when it registers itself with the `$ethernet` subsystem. 

`annotateAdapters(adapter:list)` -> promise

	This method is called by the ethernet subsystem to annotate the list of
	adapters before it is returned to the user. It takes the list of
	adapters to be annotated as parameter and returns a promise that should
	resolve once the operation has completed. The method should do what
	it's name suggests - it should annotate the list by either modifying
	it's existing properties in place or by adding new ones. This method
	returns a promise because it is common that such an operation will look
	inside other configuration files on the server before returning the
	modified list - all of which usually involves asynchronous operations. 
	

