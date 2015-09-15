# $uci factory

UCI interface simplifies your access to the uci subsystem through the
javascript interface. This library uses $rpc service underneath to issue rpc
calls to the uci object on the backend (implemented in rpcd). 

This module will load all of the uci configs into local browser memory so that
you can just modify uci settings as though they were ordinary variables. 

The UCI subsystem consists of a number of objects: 

* UCI - main subsystem
* UCIConfig - interface to a uci config
* UCISection - interface to a config section
* UCIField - a field inside a uci section

## UCI methods

	$init: function() -> promise
		Initializes UCI subsystem and populates the list of configs with all
		available configs. UBUS subsystem has to already be initialized. 

	$registerConfig: function(name) -> none
		Registers a config with UCI subsystem. This does not create any config
		file on the system or modify any UCI settings. It merely tells the uci
		system that this config exists so that it can be accessed through the
		$uci.<config> interface. This method is used to register config schemas
		in plugins in order to tell UCI how to interpret a configuration file.  
	
	$sync: function(name|list[name]) -> promise
		Synchronizes the given config from uci with local representation of the
		data. This method should be called before any sections can be accessed
		though $uci.config.<section> interface. Usually you would call this
		method before changing any uci settings. 

	$revert: function() -> promise
		Reverts all currently loaded configs. This will actually call uci
		revert on each config in series. If you want to revert a specific
		config then call $uci.<config>.$revert() instead. 
	
	$rollback: function() -> promise
		Calls uci rollback method. This rolls back all current uci changes
		using a single call (while $revert needs a config parameter).  

	$apply: function() -> promise
		Calls uci apply. You don't actually need to use this method because
		$uci.$save does the same thing but much better.  

	$save: function() -> promise
		This method goes through all currently loaded configs and calculates
		the changes that have been made. After it has a list of changes, it
		calls uci set for each configuration file that has been changed and
		finally saves the changes to uci. You should call this method when you
		are done with editing uci configuration and want to save your changes. 

