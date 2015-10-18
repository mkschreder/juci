define Plugin/juci-network-netifd/install 
	@$(INSTALL_DIR) $(1)/www/img
	@$(INSTALL_DIR) $(1)/usr/lib/rpcd/cgi/
	@$(INSTALL_DIR) $(1)/usr/bin/
	@$(INSTALL_DIR) $(1)/sbin/
	@$(INSTALL_DIR) $(1)/etc/init.d/
	@$(CP) $(PLUGIN_DIR)/src/images/* $(1)/www/img/
	@chmod +x $(PLUGIN_DIR)/service/*
	@$(CP) $(PLUGIN_DIR)/service/juci-netdevd $(1)/sbin/
endef
