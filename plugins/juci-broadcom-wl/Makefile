define Plugin/juci-broadcom-wl/install 
	$(INSTALL_DIR) $(1)/etc/init.d/
	$(INSTALL_DIR) $(1)/sbin
	chmod +x $(PLUGIN_DIR)/service/*
	$(CP) $(PLUGIN_DIR)/service/juci-broadcom-wld $(1)/sbin/
endef
