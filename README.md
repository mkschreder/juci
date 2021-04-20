JUCI Webgui for Embedded Routers
--------------------------------

Author: Martin K. Schröder <mkschreder.uk@gmail.com>

* Latest version of juci is v2.16.12
* Juci feed for openwrt with all other packages that juci depends on can be
  found here: https://github.com/mkschreder/juci-openwrt-feed.git

JUCI architecture looks roughly like this: 

![JUCI Architecture](/media/juci-architecture.jpg)

JUCI frontend is built with html5, angularjs and bootstrap: 

![Desktop](/media/screenshot.jpg?raw=true "JUCI Screenshot")

JUCI is theme-able and fully mobile-ready (responsive): 

![Mobile](/media/mobile.jpg)


JUCI is modern web interface developed for OpenWRT-based embedded devices. It
is built using HTML5 and angular.js and uses websockets for communicating with
a compact and fast lua backend running on the embedded device. You can build
both the frontend application and the backend server independently of each
other and use them separately. 

The OrangeRPCD project which JUCI uses as it's websocket based backend RPC
server can be found here:
[https://github.com/mkschreder/orangerpcd.git](https://github.com/mkschreder/orangerpcd.git). 

JUCI Documentation in HTML form can be found here:
[http://mkschreder.github.io/juci](http://mkschreder.github.io/juci/)

It is recommended that you start by reading overview of how juci works found
here:
[http://mkschreder.github.io/juci/manual/how-juci-works.html](http://mkschreder.github.io/juci/manual/how-juci-works.html)

JUCI Flash and Memory Requirements (actual runtime usage): 

- ~5M flash for full-featured frontend install (including http server)
- ~160k flash for backend rpc server (revorpcd)
- 16M ram (revorpcd + lighttpd server) 

News
----

Latest version of juci is 2.16.05. 

Release notes: 
- Removed plugins that do not work on OpenWRT. 

Release notes version 2.16.03: 
- Moved backend to a specialized juci server and removed dependency on ubus in
  the backend (see motivation below)

Removing ubus dependency (Feb 2016)
-----------------------------------

Original juci server was using ubus as it's primary way to organize backend
components. This seemed like an awesome idea at the time when juci project was
started. Everyone was going to "ubusify" everything. But with time this was
starting to cause more pain than good. I will try to explain the implications
of "ubusifying" everything below. 

Ubus is an excellent system for interprocess communication. However, using it
for organizing components of a single application is a very bad idea. It leads to
what can best be compared to "microkernel" design. This forces even the most
simple tasks such as checking whether user has access rights to some resource
to require a serialization and deserialization of parameters (twice!).
Micokernel is no different in that it forces everything to be a service. We
know from experience that microkernels never really have been successful
because their performance sucks for quite obvious reasons (you end up spending
most of your time packing and unpacking messages instead of just making simple
method calls). 

So latest version of juci eliminates all this meaningless rpc message passing
and instead implements a single lua backend server that responds to rpc calls
from the client and directly provides all necessary services to all backend
components that are installed. Instead of all backend components making ubus
calls for things like session control, they all now instead just make direct
calls into the backend server and this is orders of magnitude more efficient
then all the unnecessary internal ubus calls. 

Ubus is still supported of course and in fact you should use ubus as means of
communicating with other programs running on the system. But for components of
the juci backend ubus is no longer used. A single backend server is currently
the best solution that I have tried. I have also tried using CGI and lua
scripts, but I was not happy with the performance of that solution. It is
important to be able to support large number of rpc calls and a specialized
juci server makes this very easy to do. 

What is JUCI? 
-------------

If offers you the following: 

- Extremely resource-efficient for your device - your router only needs to run
  the core functions (which can be written in C!) and the gui itself is running
  entirely inside the client's browser). You router only computes and sends the
  minimum information necessary. 
- Full mobile support
- Easy to work with - the code uses angular.js and html5, making it extremely
  easy to add new gui elements to the gui. 
- Full control and flexibility - yet many ready-made components: allowing you
  to pick yourself which level you want to develop on. There are no
  restrictions to the look and feel of your gui. 
- Dynamic theming - you can switch color themes at runtime. 
- Full language support - allowing for complete localization of your gui.
  Language file generation is even partially automatic (for html text). Also
  supporting dynamically changing language on page without having to reload the
  application. Also featuring quick debug mode for translations where you can
  see which strings are missing in currently used language pack. 

Usage on OpenWRT
----------------

Here is how to build a user-mode-linux juci test build. For other architectures
these instructions will for the most part be the same (apart from the uml
options). UML image will run the whole system as a single executable on your
host so you don't need to use any kind of emulator.  

	# go to your openwrt directory
	cd openwrt

	# do a full clean (at least delete all your feeds first because we will be overriding things)
	make distclean

	# add juci feed to feeds conf
	echo "src-git-full juci https://github.com/mkschreder/juci-openwrt-feed.git" >> feeds.conf.default

	# update your feeds
	./scripts/feeds update -a 

	# first install all juci packages with force flag
	./scripts/feeds install -f -a -p juci

	# THEN install all openwrt packages
	./scripts/feeds install -a

	# select a few top level packages
	cat >> .config
	CONFIG_TARGET_uml=y
	CONFIG_PACKAGE_juci-full-openwrt=y
	CONFIG_PACKAGE_orange-rpcd=y
	CONFIG_BUSYBOX_CUSTOM=y
	CONFIG_BUSYBOX_CONFIG_SHA1SUM=y
	^D

	# fill out the rest of the selections
	make defconfig

	# build your image 
	make 
	
	# image will be in bin/uml

Before you test your image you need to set up tuntap network device on your host so that you can connect to the gui on the uml image:  
	
	# install user mode linux utils
	sudo apt-get install uml-utilities

	# create a tuntap network device
	sudo tunctl -n <your user id>
	
	# set ip address of our tap 
	sudo ifconfig tap0 192.168.2.254

	# enable ip forwarding 
	bash -c 'echo 1 > /proc/sys/net/ipv4/ip_forward'
	
	# add route
	sudo route add -host 192.168.2.100 dev tap0

Now you can start your uml image: 
	
	cd openwrt/bin/uml/
	
	# starm uml image with tun tap network interface
	./openwrt-uml-vmlinux ubd0=/data/software/openwrt-cc/bin/uml/openwrt-uml-ext4.img eth0=tuntap,tap0

Once you are in openwrt do this: 

	# add orangerpcd user admin
	orangectl adduser admin

	# set password for juci user admin
	orangectl passwd admin admin

	# set network ip of openwrt to correct ip 
	uci set network.lan.ipaddr=192.168.2.100
	uci commit
	ubus call network reload

	# you will probably need to reboot because tuntap seems to be broken without it 
	poweroff

Now restart the uml image again and you should be able to access the gui at
192.168.2.100 using your browser.  

Menus will be automatically configured by the juci-full-openwrt package uci-defaults
scripts. If you want to use juci in a custom firmware you would typically
create a custom metapackage that would only select your plugins and configure
JUCI according to your own custom needs.

If you go to your router ip you should see the login screen. By default admin
user is used to login but if you don't have password set for admin user you
will not be able to login. So then go to the console and set password for admin
user or change the user used for logging in by editing /etc/config/rpcd and
then do /etc/init.d/rpcd restart. 

If you can not login, it could be that you have not installed all juci packages
correctly. JUCI requires modified versions of rpcd and uhttpd. In the case that
you did not install the feed with "-f" option, you will not be overriding rpcd
and so you will not be able to login. 

JUCI also includes a nodejs server which you can do for local testing and for
forwarding jsonrpc calls to your router during testing (juci-local-server). 

Contribution
------------

If you want to contribute to this project, feel free to submit pull requests. 

Good to know
------------

Addons can be developed on top of juci by creating package that installs js and
css files into the router /www folder and then runs juci-update at postinstall
(index.html is actually generated automatically). 

In most cases you will never need to modify core juci code. If you need to
change behavior of some function, you can always override the public function
in javascript without having to modify the original implementation. 

Juci uses modified version of uhttpd that can serve gz files with proper
content type based on actual gzipped content. 

JUCI also uses modified versions of ubus and rpcd on openwrt which you can also
install from the feed (using -f option). 

Getting started
---------------

New: you can now find compiled juci manuals here:
[http://mkschreder.github.io/juci/](http://mkschreder.github.io/juci/)

JUCI is designed to work primarily on OpenWRT based systems. Even if you surely
can use this code on other systems as well, a lot of functionality is
implemented in the backend using OpenWRT tools and packages. So you will
naturally need to build your firmware using openwrt to get the most of juci. 

To install necessary tools to compile JUCI you can use the file
./scripts/ubuntu-bootstrap.sh. Run it using sudo.  

JUCI is a collection of many files including individual javascript files, html
templates, translations and styles (written in LESS). All of these files need
to be built into a set of modules which can then be included as scripts into an
index.html page. This is done using make. 

	make - without any arguments builds production files (minified and gzipped). 
	make debug - builds uncompressed files for use with juci-local-server. 

When developing, it can be very good to use local server because it allows you
to continuously test your changes locally. Local server is a small program
written using node.js that starts a local http server while forwarding ubus
calls to a real box.

To run local server for testing new gui elements during development: 

	./juci-local-server --host <your router ip with juci installed>
	
	now go to http://localhost:3000/ to see the local gui. 

	when you make changes in code, run make debug again and reload the local page. 

Common Issues
------------

* I visit the home page and can not see anything. The homepage is blank. 

	Solution: open up your browser console and see if you have some error printed there.

* Juci fails to start. Says juci.ui.menu ubus call is missing. 

	Solution: make sure ubus-scriptd is running on the router. And make sure it
	loads all scripts without errors. To check, do /etc/init.d/ubus-scriptd
	stop and then just run ubus-scriptd. It will print a trace. Now cancel it
	with ctrl+c and once you fix the errors restart it using
	/etc/init.d/ubus-scriptd start. Then make sure the necessary call is
	present in output of "ubus list"

* I get to login page but can not login. What is the password? 

	Solution: the login user is set in /etc/config/rpcd. Password is the unix
	password for that user - which you can change using passwd <username>. 

* I can login but get a big fat error box with a lot of text mentioning angular. 

	Solution: this means that some module completely failed to initialize or
	that you have syntax error somewhere or that you have duplicate controller
	names or anything else that will cause an exception in angular. Usually the
	first thing to do is check browser console for any messages before the
	error. Then check the cryptic anuglar message mentioned in the error to get
	a clue on what to do next.

* My page xyz can not access ubus. I get "Access Denied" in browser console. 

	Solution: check that you have proper acl permissions configured in your
	access.json file in your plugin (if it is not there then create it - use
	existing plugins to see how). Then copy this file to your router and
	restart rpcd (/etc/init.d/rpcd restart). Then it should work. 

* My build process just hangs at line that contains "npm"

	Solution: build process needs connection to the internet to download
	necessary dependencies for some build scripts. If it is not possible then
	programs like "npm" may block indefinetely. 

* Compilation fails at "Compiling css/..juci.css.."

	Solution: this happens when yui-compressor (css minifier (which is written
	in java)) runs out of memory. This file tends to get large, and minifier
	needs more memory. Make sure your java VM is configured to use larger stack
	size (I find it amazing how easily java always wastes memory). 

Unit testing
------------

NOTE: unit testing is no longer supported for now since sep 2015! But old files
are still there. 

Previously it was possible to run juci core in node js and make ubus calls
directly from command line. This functionality is still there and is
implemented in lib-juci in tests directory, but it has not been used for a
while so probably things have become outdated there. It would be nice in the
future to actually make most of the angular factories standalone modules
available through nodejs. This is not a difficult task because the code itself
is very easy to make into a standalone library not dependent on angular. 

This is on the list of things to be done. 

Using UCI from the web console
-------------------------------

It is possible to use UCI directly from your browser console. When you open
your console you will have a global uci object defined in the application.

	$uci.$sync("wireless") // will sync the wireless table
	$uci.$sync(["wireless", "hosts"]) // will sync both wireless and hosts configs. 
	
	$uci.wireless.wl0.channel.value = 1 // will set channel value to 1 
	
	$uci.$save() // will save the uci config
	
All of the above methods return a promise. So if you need to run code AFTER the
operation completes, you have to set the done (or fail/always) callback for the returned
promise. You do it like this:  

	$uci.$sync("wireless").done(function(){
		console.log("Channel: "+$uci.wireless.wl0.channel.value); 
	}).fail(function(){
		console.log("Failed to sync tables!"); 
	}).always(function(){
		console.log("Done!"); 
	}); 
	
When you invoke $sync() the uci code will load the specified configs into
memory. The config types must be defined in your plugin first, so that fields
that are not present in the configs can be created with their default values.

For more details on how this is done, check the .js files in the plugins under
src/ folder (not pages and widgets, but the main plugin file which is usually
called plugin-name.js or just main.js). 

Just like in command line uci, JUCI gives you several ways to access config
elements: 

	$uci.wireless["@all"] // list of all sections in the wireless config
	$uci.wireless["@wifi-device"] // list of only the wifi device sections
	$uci.wireless.wl0 // access wl0 section by name (all sections that have a name can be accessed like this)
	$uci.wireless.cfg012345 // access a section with an automatically created uci name. 
	
Each field in uci section has a "value" member which is current value of that
field. So if you use uci sections in your gui elements you have to use .value
in order to set their values. 

JUCI also retains the default and original values of each field so that you can
revert the value to what it was when you loaded the config. 

It is also possible to attach validators to each field. Examples are in uci.js
file. 

Backend Code 
------------

Juci backend mostly consists of scripts that implement ubus functions which
become available to the gui code through json rpc. These scripts are simple
glue that juci uses to interact with the rest of the system. You can place
these scripts in ubus/ folder of your plugin. Each script should have a
globally unique name (preferably a name that identifies it as being part of a
specific plugin) and it will be placed into /usr/lib/ubus/juci folder on the
router. 

All of these scripts are then managed by ubus-scriptd service on the router
which makes then available on ubus.

ubus-scriptd supports both batch scripts and services. Most of juci backend
tasks are usually batch scripts that become ubus objects.  

Further information
-------------------

JUCI documentation can definitely be improved. You can speed up this process by
posting your questions on the issues board on juci github page
(https://github.com/mkschreder/juci/issues). 

License Notice
--------------

	All individual parts in JUCI are Copyright of their respective authors. 

	Current list of contributors: 

		Reidar Cederqvist <reidar.cederqvist@gmail.com>
		Stefan Nygren <stefan.nygren@hiq.se>
		Martin K. Schröder <mkschreder.uk@gmail.com>
		Charlie Robbins <http://nodejitsu.com>
		Craig Mason-Jones
		Kord Campbell <kord@loggly.com>
		Mihai Bazon
		Philippe Rathé <prathe@gmail.com>

	This program is free software; you can redistribute it and/or
	modify it under the terms of the GNU General Public License
	version 3 as published by the Free Software Foundation.

	This program is distributed in the hope that it will be useful, but
	WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
	General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program; if not, write to the Free Software
	Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
	02110-1301 USA
