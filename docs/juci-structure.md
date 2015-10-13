# JUCI file system structure

To make development more straightforward and in order to faciliate easy
searching and editing of files, juci follows a certain set of rules with
regards to file names. 

PLUGINS
=======

The easiest way to build plugins in juci is to simply include them into the juci plugin tree and they will be built automatically (of course provided that you have selected the plugin in Makefile.local or in the make environment above that builds juci). All plugins in juci follow a standard directory structure. This allows all plugins to be built using the same makefile. You can however add your own custom makefile with custom commands that you want to execute during the build.  

	plugins/
	|-- yourplugin-unique-name/
	  |-- src/
	    |-- pages/
	    |-- widgets/
	  |-- some_general_js_code.js
	|-- Makefile
	|-- access.json

THEMES
======

At the buildsystem level juci does not differentiate between plugins and themes. So the same directory structure that is used for plugins will also work for themes. 

MAKEFILE
========

Even if you don't put anything in the Makefile, just will use default settings and scan src/{pages,widgets} folders for html and js files. But if you still want to have greater control of what is included then you can manually add your source files to build process by defining a section called Plugin/<yourpluginfoldername> and then alter one of these fields: 

	define Plugin/<somename>
		CODE_LOAD:=<num> - this specifies loading order. It is sometimes important to control load order. Default is 50. Juci core has this set to 01 to load juci before any other modules. 
		STYLE_LOAD:=<num> - this is the same for styles
		TPL_LOAD:=<num> - this is for templates (html). If you load your templates AFTER another module then you can basically override any template in any preceding module by simply creating file with the same name. 
		JAVASCRIPT-y:=<javascript files> - specify your js files
		STYLES-y:=<css> - specify styles
		TEMPLATES-y:=<html> specify html templates
	endef

You can also create an install hook in case you need to install any extra files to the root when make install command is run. 

	define Plugin/<yourplugin>/install
		PLUGIN_DIR - this variable is set by juci to current plugin directory (absolute path)
		CP - set to command used for copying files
		INSTALL_DIR - set to command for installing directories
		$(1) is install destination 
	endef


RULES
=====

* all pages must have the same filename as the URL hasbang identifying the
page. 
	
	`WHY`: so that you can look at url ex. #!internet-dns and know that this page
is in file internet-dns.[html|js] (or old style internet.dns.[html|js]).

* all page files must be globally unique across all plugins. 

	`WHY`: so that you can easily override pages from other plugins. Even if the
files did not have unique names, you would still need to have unique
controllers and directives across ALL plugins that are in use. Therefore this
does not in any way limit you. It is a good thing that allows you to for
instance override default page or widget in a juci theme. 

* all widget files must be globally unique for all widgets across all plugins.

	`WHY`: same as for pages. You can't have two html tags with same name in angular
anyway. You can still override files though.

* all widget filenames should have a name that reflects the name of the
directive and the controller for the widget.

	Keep in mind that angular directive name is in "camelCase" while the
resulting html tag is in "camel-case" with a dash in between where a capital
letter is placed in the directive. 

	`WHY`: because it makes it very easy to navigate a tree of files and right
away go to the file where the widget is implemented. In vim this is a matter of
simply using text search function inside a NERDTree window - but even in geany
TreeViewer it is easy to visually find the file that contains html widget code.
And since names are globally unique, you will only have a file with that name
in a single place. When you then change names of your directive/controller, it
is a good idea to also change the name of the file. 

* all lua script objects should have the same filename as the object on ubus.

	Well actually, ubus-scriptd will take care of that. 

