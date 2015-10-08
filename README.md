JUCI Webgui for Embedded Routers
--------------------------------

JUCI is a JavaScript-based web interface for broadband routers running Iopsys / OpenWRT.

JUCI is built with html5, angularjs and bootstrap: 

![Desktop](/media/screenshot.jpg?raw=true "JUCI Screenshot")

JUCI is theme-able and fully mobile-ready (responsive): 

![Mobile](/media/mobile.jpg)

Usage on OpenWRT
----------------

You can now try JUCI on openwrt. 

Here is how to install it:

- Add juci feed to your feeds.conf.default
src-git juci https://github.com/mkschreder/juci-openwrt-feed.git

- Update and install the feed
./scripts/feeds update juci
./scripts/feeds install -p juci -a

- select juci core, inteno theme and plugins under JUCI menu in menuconfig

- BUILD! 

And it should work. If you then go to your router ip you should see the login screen. By default admin user is used to login but if you don't have password set for admin user you will not be able to login. So then go to the console and set password for admin user or change the user used for logging in by editing /etc/config/rpcd and then do /etc/init.d/rpcd restart. 

JUCI also includes a nodejs server which you can do for local testing and for forwarding jsonrpc calls to your router during testing (server.js). 

What is JUCI? 
-------------

If offers you the following: 

* Extremely resource-efficient for your device - your router only needs to run the core functions (which can be written in C!) and the gui itself is running entirely inside the client's browser). You router only computes and sends the minimum information necessary. 
* Full mobile support
* Easy to work with - the code uses angular.js and html5, making it extremely easy to add new gui elements to the gui. 
* Full control and flexibility - yet many ready-made components: allowing you to pick yourself which level you want to develop on. There are no restrictions to the look and feel of your gui. 
* Dynamic theming - you can switch color themes at runtime. 
* Full language support - allowing for complete localization of your gui. Language file generation is even partially automatic (for html text). Also supporting dynamically changing language on page without having to reload the application. Also featuring quick debug mode for translations where you can see which strings are missing in currently used language pack. 

Simple Summary
------

Addons can be developed on top of juci by creating package that installs js and css files into the router /www folder and then runs juci-update at postinstall (index.html is actually generated automatically). 

Juci uses modified version of uhttpd that can serve gz files with proper content type based on actual gzipped content. 

Juci also uses several newly added rpc calls that are only implemented on iopsys firmware from Inteno Broadband Technology. These packages are open source so you can get all off them from inteno sdk (see below). 

Juci also uses modified version of rpcd, which too is available from iopsys sdk. 

Getting started
---------------

Ideally you should get iopsys (OpenWRT based) sdk and build juci from there. This updated version is heavily based on updated versions of openwrt packages found in iopsys sdk and so you should use that primarily. (kinda-sorta-like-this: git clone http://ihgsp.inteno.se/git/iopsysAA.git iop && cd iop && git checkout BB && ./iop_get_feeds.sh && make)..  

Building compiled and gzipped htdocs: 
	
	make 

Note: the make process will try to install missing dependencies and automatically link /usr/bin/node to /usr/bin/nodejs for compatibility. For this, you may be prompted for your sudo password. This will only be done once. 

Building uncompressed htdocs (for use with local server - the local server script runs this automatically at intervals): 
	
	make debug

To run local server for testing new gui elements during development: 

	./juci-local-server --host <your router ip with juci installed>
	
	now go to http://localhost:3000/ to see the local gui. 

	when you make changes in code, run make debug again and reload the local page. 

Common Issues
------------

* I visit the home page and can not see anything. The homepage is blank. 

	Solution: open up your browser console and see if you have some error printed there.

* Juci fails to start. Says juci.ui.menu ubus call is missing. 

	Solution: make sure ubus-scriptd is running on the router. And make sure it loads all scripts without errors. To check, do /etc/init.d/ubus-scriptd stop and then just run ubus-scriptd. It will print a trace. Now cancel it with ctrl+c and once you fix the errors restart it using /etc/init.d/ubus-scriptd start. Then make sure the necessary call is present in output of "ubus list"

* I get to login page but can not login. What is the password? 

	Solution: the login user is set in /etc/config/rpcd. Password is the unix password for that user - which you can change using passwd <username>. 

* I can login but get a big fat error box with a lot of text mentioning angular. 

	Solution: this means that some module completely failed to initialize or that you have syntax error somewhere or that you have duplicate controller names or anything else that will cause an exception in angular. Usually the first thing to do is check browser console for any messages before the error. Then check the cryptic anuglar message mentioned in the error to get a clue on what to do next.

* My page xyz can not access ubus. I get "Access Denied" in browser console. 

	Solution: check that you have proper acl permissions configured in your access.json file in your plugin (if it is not there then create it - use existing plugins to see how). Then copy this file to your router and restart rpcd (/etc/init.d/rpcd restart). Then it should work. 

* My build process just hangs at line that contains "npm"

	Solution: build process needs connection to the internet to download necessary dependencies for some build scripts. If it is not possible then programs like "npm" may block indefinetely. 

* Compilation fails at "Compiling css/..juci.css.."

	Solution: this happens when yui-compressor (css minifier (which is written in java)) runs out of memory. This file tends to get large, and minifier needs more memory. Make sure your java VM is configured to use larger stack size. 

Unit testing
------------

NOTE: unit testing is no longer supported for now since sep 2015! But old files are still there. 

Unit testing is done using grunt task "test". You can invoke this task using command: 

	grunt test --host=<router ip> --user=<rpc user> --pass=<rpc user pass>
	
This will typically search htdocs folder for all files located in "tests" directory and begining with "test-" (and ending with ".js"). Running tests will ensure that the router is working as the gui expects it to work. If any tests fail then you will know ahead of time that some key functionality is broken, bofore interacting with the gui in browser. 

In all of your unit tests you should include the lib-juci file that is located in tests directory. This file will setup the test environment so that you can use the core functions just like you would use them in angular. Note that angular is currently not available in test environment. 

Using UCI from the web console
---------------------

It is now possible to use UCI directly from your browser console. When you open your console you will have a global uci object defined in the application.

	uci.sync("wireless") // will sync the wireless table
	uci.sync(["wireless", "hosts"]) // will sync both wireless and hosts configs. 
	
	uci.wireless.wl0.channel.value = 1 // will set channel value to 1 
	
	uci.save() // will save the uci config
	
Note however that both uci.sync() and uci.save() are async methods so they return a promise. So if you need to do several operations in series then you need to do it like this: 

	uci.sync("wireless").done(function(){
		console.log("Channel: "+uci.wireless.wl0.channel.value); 
	}).fail(function(){
		console.log("Failed to sync tables!"); 
	}).always(function(){
		console.log("Done!"); 
	}); 
	
When you invoke sync() the uci code will load the specified configs into memory. The config types must be defined in uci.js file so that fields that are not present in the configs can be created with their default values. Please look in js/uci.js for details. This configuration may be moved somewhere else later. 

There are several ways to access config elements: 

	uci.wireless["@all"] // list of all sections in the wireless config
	uci.wireless["@wifi-device"] // list of only the wifi device sections
	uci.wireless.wl0 // access wl0 section by name (all sections that have a name can be accessed like this)
	uci.wireless.cfg012345 // access a section with an automatically created uci name. 
	
I have tried to mimic the command line uci tool here as much as possible. 

When you need to set a field value you need to use "value" member of the field. This is because we want to retain default and original value inside the field object so this is the only way to do this. This value field is defined with a setter and a getter so when you set a value that is different from the value retreived from your router then a field will be marked as dirty and will be sent to the router next time you call save(). 

	uci.wireless.wl0.channel.value = 1

JSONRPC service
---------------

Included in the source code is also a plugin for rpcd daemon on your OpenWRT router. It is designed to be the backend service that will handle your custom jsonrpc calls. You can hower run the application entirely on your local computer with no other dependencies but nodejs. All you have to do is implement the jsonrpc calls in your local service instead (see server.js). 

Getting to know the source code
-------------------------------

JuCi is a javascript application that gets loaded inside index.html file in htdocs directory. This file will be served as index page when you run the local server. The main application is found in js/app.js. This module in turn reads configuration and loads plugins found in the plugin folder. Each plugin contains a plugin.json file which tells the gui which javascript modules to load. 

There is one main javascript file and one html file for every page/widget/directive. In plugins you will usually not access angular directly but instead use $juci global variable to register controllers, directives and routes. This is because plugins are loaded dynamically when the application is already running and therefore we can not instantiate controllers in the usual way by using angular.module(..).controller(..) - use $juci.controller(..) instead. 

The menu system in the gui is actually created on the router side and retreived using juci.ui.menu rpc call. This is based on the juci way of doing this task. It allows us to have dynamic menus that are automatically generated to match the functions of the router. 

License Notice
--------------

Copyright (C) 2015 JUCI Project. All rights reserved.

Contributors: 
	- Martin K. Schröder <mkschreder.uk@gmail.com>
	- Reidar Cederqvist <reidar.cederqvist@gmail.com>
	- Noel Wuyts <skype: noel.wuyts>: angular, widgets, development
	- Feten Besbes <skype: feten_besbes>: css

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
