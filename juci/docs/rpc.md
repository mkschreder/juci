# $rpc factory

This factory provides access to the rpc subsystem on OpenWRT through
uhttpd-mod-ubus plugin. In juci, all dynamic data requests are done through
json rpc. So most plugins will use this module to communicate with the backend. 

The rpc module is available in two ways: 

* 	angular $rpc factory / service
* 	$rpc variable in the browser window object (you can access it like that in
 	browser console)

For the most part you will be using the angular service for doing rpc calls
because most of juci plugins are angular objects. 

### accessing $rpc in angular

	JUCI.app.controller("yourController", function($rpc){
		$rpc.juci.ui.menu().done(function(){

		}); 
	});

### accessing in window

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

## rpc object methods
	
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

## building the backend

JUCI backend can be any kind of ubus plugin, but juci itself uses lua plugins
that are loaded by the main juci rpcd module. This allows you to write the juci
backend in any scripting language that you like (which of course needs to be
present on the router). JUCI prefers to use lua for backend scripting though. 

## communicating with the backend

Once your backend is accessible on ubus and you have configured uhttpd to allow
you access to it's ubus methods, you can use the $rpc object to access your
method just as though it would have been any javascript method. 

Example:

	$rpc.my.object.method().done(function(result){
		console.log(JSON.stringify(result)); 
	}); 

