# JUCI addons

JUCI itself is only 12 javascript files. Most of the functionality in JUCI comes from plugins. 

So how do you create plugins? 

JUCI makes it very easy to create addons. The easies way to add a new modules is to create a folder in the plugins directory that has this structure: 

	plugins/
		new-module
			src
				pages 
				widgets
				somemainfile.js
			backend
				.. backend scripts go here
			Makefile
			access.json
			menu.json

You should keep this structure same for now because juci right now relies on plugin code to be structured this way. 

# the Makefile

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


