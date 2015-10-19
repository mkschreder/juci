CREATING THEMES
===============

There are 5 ways that you can customize your juci interface. 

* `style your theme with CSS` - this way you can make colorscheme adjustments to an exiting theme
* `override existing page html` - this way you can tweak html structure of existing controlls and pages
* `write new pages` - you can also create completely new pages using html and javascript
* `write custom plugins` - you can put together complete replacements for existing packages
* `develop a completely standalone interface that uses juci RPC calls` - this way you can for example create native mobile apps and extensions. 

THEMES
======

At the core level there is little difference between a theme and a plugin. JUCI treats both plugins and themes the same. The main difference is that you can only have a single theme active, but you can have many plugins selected. In this way, themes are always in conflict with all other themes, and plugins are usually written in a way that allows them to coexist with other plugins. Themes are also typically loaded last in the html file so that they always override all styles and templates from all other JUCI modules. This order of loading is however user determined and works the same way even for plugins. So essentially you can have a plugin that implements all of the theme functionality - but this is not recommended becuase it is then not clear to the user what is a theme and what is a plugin. 

COMPILING A THEME
=================

There are two ways to compile your theme: 

* `add a symplink to your theme in the main juci themes directory` then select CONFIG_PACKAGE_<your theme dir name>=y makefile variable and run make (you can set this in your Makefile.local if you want to test using your local server)
* `create a separate directory outside of juci tree` and build using juci external mode make: make -C <path to juci source> MODULE=<absolute path to your theme source>

When juci builds your theme as an external module it will create a <bin> folder in your plugin directory where it will place all processed files just like they will be installed in the final root tree. So you can just copy the contents of this bin folder to the root of your final installation in order to install the theme. 

TESTING USING LOCAL SERVER
==========================

You can test your theme using local server. For this you will need to tell your local make to build all the necessary plugins. 

* copy example-Makefile.local to Makefile.local and make adjustments to it. Select all the packages you need, including your theme. 
* run "make debug". 
* run ./juci-local-server --host `a working rpc host`

Even though the server works locally, you still need to have a working installation somewhere that will provide your local interface with RPC data. 

When you make changes, run "make debug" again and reload the page for changes to take effect. The reason you will use debug target is so that you can see your javascript code unmodified. Default make target will typically compress javascript code and make it difficult to debug. 
ADDING IMAGES AND OTHER ASSETS
==============================

In your theme folder you can have an optional Makefile with special JUCI target Package/your_plugin/install where you can define extra commands that will run as part of installing all necessary files to root. 

	define Package/myplugin/install
		$(INSTALL_DIR) $(1)/www/img
		$(CP) $(PLUGIN_DIR)/img/* $(1)/www/img/
	endef

The syntax of this section is very similar to how you would write these sections in openwrt make system. 

* $(1) is the install directory
* $(PLUGIN_DIR) is the directory where your plugin is currently being built
* $(INSTALL_DIR) is basically defined as "mkdir -p" 
* $(CP) is "cp -Rp" etc. 

INTEGRATING WITH OPENWRT
========================

To integrate your theme package into openwrt you will also need to create a separate openwrt Makefile for your theme. You will typically put this Makefile into a feed and make it available for inclusion into an OpenWRT build. The source code of your theme can then either be included into the feed, or downloaded separately when openwrt builds your theme. Do not include any OpenWRT specific things into the main theme Makefile. Even though it may look compatible - it is not the same. 
