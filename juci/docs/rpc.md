JUCI $rpc SUBSYSTEM
===================

This factory provides access to the rpc subsystem on OpenWRT through
uhttpd-mod-ubus plugin. In juci, all dynamic data requests are done through
json rpc. So most plugins will use this module to communicate with the backend. 

The rpc module is available in two ways: 

* angular $rpc factory / service
* $rpc variable in the browser window object (you can access it like that in
 	browser console)

For the most part you will be using the angular service for doing rpc calls
because most of juci plugins are angular objects. 

`accessing $rpc in angular`

	JUCI.app.controller("yourController", function($rpc){
		$rpc.juci.ui.menu().done(function(){

		}); 
	});

`accessing in window`

	$rpc.juci.ui.menu().done(function(){

	}); 

All rpc methods return a jquery promise which has three methods: done, fail and
always. You can supply your callback to these methods which will be called when
the request either succeeds or fails. always() callback will be called in every
case.

RPC methods themselves are created on the fly in juci based on the list of
available rpc methods present on the target system (it uses list of ubus
objects for this). So you will never need to add methods to this object
manually. Just add them in the backend and they will appear in the object.
There are however access control lists that may prevent you from accessing your
method from the gui, and to fix this you will need to create corresponding
access.json file and then install it with unique name into
/usr/share/rpcd/acl.d/ folder on the router. Exactly how to configure acl lists
is described in more detail in OpenWRT rpcd documentation. 

METHODS
=======
	
	$sid: function(sid) -> sid
		Set or get current session id for currently active session

	$isLoggedIn: function() -> bool
		Check if you are currently logged in to rpc. Returns true or false. 

	$authenticate: function() -> promise
		Attempt to access the current session. Will succeed if you are logged
		in, but will fail when your session ends abruptly or times out on the
		router. This is a good way to test if you still can access your
		session. 

	$login: function({username, password}) -> promise
		Login using supplied credentials. For this method to work, your rpcd
		test should allow you to access session.login method when you are not
		authenticated (default defined in unauthenticated.json acl list). 
	
	$logout: function() -> promise 
		Logout current session. 
	
	$init: function() -> promise
		Initializes the $rpc object. This method will also generate appropriate
		methods in the $rpc object that correspond to the ubus methods that are
		available on the backend. Note that this method currently will be able
		to get all of the available ubus methods through http without logging
		in using current version of rpcd. In the future this may change to
		include only the methods availabel through unauthenticated session. 

BACKEND
=======

In order for RPC calls to work, you obviously need a backend that will execute
the call on the actual device. JUCI supports writing backend in any language
that can publish objects on ubus and it also provides support for writing ubus
objects in shell scripts. So you have a very wide choice in how exactly you
will implement your backend. JUCI is for the most part now using Lua to
implement backend functions because it has proven to be dynamic enough and also
fast on actual hardware.

Once your backend publishes it's rpc functions on ubus, they will automatically
become available in juci $rpc object once you reload the page. 

Example:

	$rpc.my.object.method().done(function(result){
		console.log(JSON.stringify(result)); 
	}); 

You do however need to configure proper access rights for your ubus methods
before you can call them. This is part of the access list (acl) configuration. 


