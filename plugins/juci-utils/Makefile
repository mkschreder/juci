define Plugin/juci-utils/install 
	@$(INSTALL_DIR) $(1)/usr/bin/
	@$(INSTALL_DIR) $(1)/usr/lib/orange/services/
	@chmod +x $(PLUGIN_DIR)/service/*
	@chmod +x $(PLUGIN_DIR)/scripts/*
	@$(CP) $(PLUGIN_DIR)/service/juci-utils-speedtest $(1)/usr/lib/orange/services/
	@$(CP) $(PLUGIN_DIR)/scripts/* $(1)/usr/bin/
endef

