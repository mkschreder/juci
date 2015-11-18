define Plugin/juci-theme-inteno 
	CODE_LOAD:=80
	STYLE_LOAD:=80
endef

define Plugin/juci-theme-inteno/install
	$(INSTALL_DIR) $(1)/www/
	$(CP) $(PLUGIN_DIR)/src/favicon.ico $(1)/www/
	$(CP) $(PLUGIN_DIR)/src/img $(1)/www/
	$(CP) $(PLUGIN_DIR)/src/fonts $(1)/www/
endef

