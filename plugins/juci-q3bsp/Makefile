# This code is provided to you as is under the terms of GPLv2 or later. 
# Adopted to juci by me. Copyright (c) 2016 Martin K. Schröder <mkschreder.uk@gmail.com>
# All demo code is Copyright 2009 Brandon Jones
# All game data is provided by ID Software Original quake team. 

define Plugin/juci-q3bsp
	CODE_LOAD:=02
	STYLE_LOAD:=01
	TPL_LOAD:=01

	STYLES-y:=
	STYLES-y+=src/css/q3demo.css
	
	JAVASCRIPT-y:=
	JAVASCRIPT-y+=src/game-shim.js
	JAVASCRIPT-y+=src/gl-matrix-min.js
	JAVASCRIPT-y+=src/stats.min.js
	JAVASCRIPT-y+=src/main.js
	JAVASCRIPT-y+=src/q3bsp.js
	JAVASCRIPT-y+=src/q3shader.js
	JAVASCRIPT-y+=src/q3glshader.js
	JAVASCRIPT-y+=src/q3movement.js
	JAVASCRIPT-y+=src/pages/*.js
endef

define Plugin/juci-q3bsp/install 
	@$(INSTALL_DIR) $(1)/www/
	@$(CP) $(PLUGIN_DIR)/data/* $(1)/www/
endef
