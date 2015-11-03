define Plugin/juci-utils/install 
	@$(INSTALL_DIR) $(1)/sbin/
	@$(INSTALL_DIR) $(1)/etc/init.d/
	@chmod +x $(PLUGIN_DIR)/service/*
	@$(CP) $(PLUGIN_DIR)/service/juci-utils-speedtest $(1)/usr/lib/ubus-services/
	@$(CP) $(PLUGIN_DIR)/scripts/* $(1)/usr/bin/
endef

