# JUCI Ethernet Module

The ethernet module is responsible for managing ethernet devices (layer2) and
providing a single point of entry for any ethernet related queries. It allows
you to add plugins that also annotate existing ethernet devices and add other
devices that belong to some specific subsystem such as adsl or wireless.
Ethernet module gets it's information from "ip" command. After that it pipes
the list of devices through all subsystems that it knows about. j Each
subsystem can then either annotate existing devices - such as setting a proper
device name based on wifi ssid or port configuration - or it can also add new
devices to the list that may currently not be up (and thus not visible thorugh
the ip command). 

## Methods of $ethernet

	addSubsystem(subsys) -> void
		
		adds a new subsystem to list of subsystems. subsys can implement
		annotateAdapters(adapter:list) to modify the list of ethernet adapters
		before it will be returned to the user. 

	getAdapters() -> promise
		
		returns the list of ethernet adapters currently present on the system
		(both adapters that are actually present and the ones that are
		configured but may not yet be up).
	
## Methods of ethernet:subsystem

	annotateAdapters(adapter:list) -> promise

		This method is called by the ethernet subsystem to annotate the list of
		adapters before it is returned to the user. It takes the list of
		adapters to be annotated as parameter and returns a promise that should
		resolve once the operation has completed. The method should do what
		it's name suggests - it should annotate the list by either modifying
		it's existing properties in place or by adding new ones. This method
		returns a promise because it is common that such an operation will look
		inside other configuration files on the server before returning the
		modified list - all of which usually involves asynchronous operations. 
	

