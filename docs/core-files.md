CORE OBJECTS
============

The core system of juci is very small. In fact, it is there basically to provide a simple startup code and to bind all other parts together. JUCI is built almost entirely using angular.js and all components are tied together mostly through angular. The core codebase merely provides ways for juci to make RPC calls to the backend and manipulate configuration settings in UCI. The core is located in /juci/src/js/ folder of the source tree.

JUCI is built in such a way that almost every file that exists in juci environment overrides something or extends already existing objects with methods and properties. Usually this is done to angular by adding controllers, directives and factories. But it is also a standard way of extending other parts of the system. 

# juci/src/js/app.js

This file takes care of registering angular.run(2) callbacks which will setup the angular application and configure default settings. All run() callbacks will run each time the application is loaded - and configure() callbacks will run before all run callbacks.

# juci/src/js/compat.js 

This is the browser compatibility layer for JUCI. It implements methods like Object.assign and Array.find which may not be present in some browsers. 

# juci/src/js/config.js 

This file is actually quite old and needs to be rewriteen to be more platform independent - and in fact, most of the things that it does can be done in better ways. But the basic purpose of this subsystem is to load configuration for juci either from /etc/config/juci uci file or from config.json found in the www root folder. 

# juci/src/js/juci.js

This is main juci library file that is supposed to initialize UCI and UBUS modules. This file supports being loaded standalone for initializing juci library and for running juci UBUS and UCI api inside for example node.js.

# juci/src/js/localStorage.js

JUCI wrapper for localStorage in browser. 

# juci/src/js/navigation.js

This file implements menu navigation model in juci.

# juci/src/js/rpc.js

This library provides interface to ubus RPC on the server. 

# juci/src/js/theme.js

Theme manager in juci. This is actually no longer used, because loading a theme has become a little more complicated than just loading a css file. But this file is still left in the tree for now because it is used by theme picker control. 

# juci/src/js/timeout.js 

Timeout system for implementing timeouts and intervals of limited lifespan that only live until next page is loaded. 

# juci/src/js/tr.js

JUCI language and translation system. This is really just a simple wrapper to make using gettext more convenient. 

# juci/src/js/uci.js

The juci UCI subsystem. Together with juci RPC this system allows to easily handle uci data by providing a convenient getter/setter based interface to uci objects so that values can easily be set inside the browser and then sync-ed automatically to the server with only changed values being sent over the wire. 

