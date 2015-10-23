Creating a Backend
==================

JUCI has two primary backends: UCI and UBUS. UCI is a data backend and UBUS is
a functional backend. This section already assumes that you are familiar with
ubus. If you are not, then more information is available on OpenWRT website. 

Short summary of UBUS
=====================

* Promarily designed for interprocess communication between processes on systems with constrained resources. 
* Is not limited to communication between processes on the same system (since ubus is fully socket based) 
* Each client connects to a ubus server through tcp and tells it which objects and methods it exports. 
* Binary protocol, yet with good support for json through use of userspace tools. 
* Flat hierarchy: objects and methods. 

How ubus works with JUCI 
========================

When a user presses a button in the web interface and angular dispatches it to
a callback, the code in the browser may decide that it needs to execute the
action on the server. It then creates a JSON object and executes an ajax
request to the server /ubus url (or whatever you have configured as your ubus
endpoint) and does a POST request formatted as JSONRPC request. When this
request arrives at the uhttpd endpoint, the first thing that the uhttpd
endpoint does is it checks if this call is allowed by current session acl list.
If it is then the JSON data is parsed and encoded into a blob buffer (a binary
representation of the json buffer) which is then passed to a ubus_invoke()
method. ubus_invoke() is part of the ubus library that is linked into the
calling executable. It requires a ubus connection to the server to be
established in order to send the rpc request and wait for the response. Then
this blob buffer is sent to the ubus server, which in turn looks up which
client socket the specified object and method is published by. The request is
then forwarded by ubusd to the client. 

When client receives the request, the ubus library automatically looks up the
method and invokes the method on the client. All of this is done in the same
thread as the rest of the client application. Ubus uses a single threaded,
select/poll based loop usually referred to as uloop. Any service that wants to
publish a method on ubus currently needs a uloop as well (unfortunately uloop
is basically static so there can only ever be a single uloop in a program - at
least as currently implemented by OpenWRT). 

The callback method parses the blob buffer and prepares another blob buffer as
a response. The response is then sent back to the caller through the same path
backwards. 

Types UBUS services in JUCI 
===========================

JUCI uses two main formats for implementing backend ubus functions: 

* script 
* service 

A script is a program that is loaded again for each subsequent call and which
exits when the call is done. Scripts can not maintain state across multiple
calls. 

A `service` is a ubus program that publishes it's own ubus objects and then
runs in the background waiting for events. A service can maintain state over
multiple calls, and usually services poll data from other sources and make that
data easily available on ubus. 

JUCI scripts and services are handled entirely by a small C program called
`ubus-scriptd`. This program first forks off into multiple instances - one for
each service that it finds - and in the main instance it creates ubus objects
for all the scripts that are published into /usr/lib/ubus/ directory tree. For
each script, `ubus-scriptd` creates a ubus object and then listens for incoming
ubus calls. Any methods that are exported by the script also become available
on ubus as part of the script object. Whenever a ubus call is made to any such
method, a new instance of the script is run by ubus-scriptd and the result is
then returned to the client.

Writing a ubus script
=====================

Note: even though these programs are called "scripts", they can very well be
binary programs. In fact, you are not even restricted to any specific
programming language as long as: 

* it can return list of methods that it supports when called with single ".methods" argument. 
* it returns valid json as response when called with "<method> <json>" arguments. 
* it always prints only valid json in the console stdout. 

When `ubus-scriptd` starts, it will run each script that it finds and pass it a
single ".methods" argument. When script gets this argument, it should print the
list of methods that it supports - and NOTHING else. The list can be either a
comma separated list, or a json object that describes each method in detail -
including the types of arguments that the method accepts.  

	<yourscript> .methods
	get,set,update

	or..

	<yourscript> .methods
	{"method":{"arg":"int","arg2":"string"}}

Valid types for arguments are: int, string and bool. 


Writing a ubus service
======================

Services are different from scripts in that they register their own ubus
methods directly and always maintain a running instance of the service in the
background. `ubus-scriptd` will fork off a separate process for each service
that you put into /usr/lib/ubus-services/ directory. 

All `ubus-scriptd` services are written in lua. Obviously if you want to write
your service in some other language then you don't even need `ubus-scriptd` to
begin with. Instead you would write your service, connect to ubus and export
methods on ubus. In fact, each lua service that is managed by `ubus-scriptd`
can just as well run as a standalone service without ubus-scriptd to manage it.
It is only more convenient to manage it though the same automatic process and
to just have to drop it into the services directory without having to write
separate init scripts for your service. 

Best place to start when it comes to writing lua ubus services is by reading
OpenWRT documentation on workign with ubus in lua: 

[http://wiki.openwrt.org/doc/techref/ubus](http://wiki.openwrt.org/doc/techref/ubus)

And here is an example: [https://github.com/commodo/ubus/blob/master/lua/test.lua](https://github.com/commodo/ubus/blob/master/lua/test.lua)

