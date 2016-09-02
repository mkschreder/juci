define Plugin/juci-event/install 
	$(INSTALL_DIR) $(1)/etc/init.d/
	$(INSTALL_DIR) $(1)/sbin
	$(INSTALL_DIR) $(1)/etc/hotplug.d/
	$(INSTALL_DIR) $(1)/www/cgi-bin/
	$(CP) $(PLUGIN_DIR)/hotplug/* $(1)/etc/hotplug.d/
	chmod +x $(PLUGIN_DIR)/service/*
	$(CP) $(PLUGIN_DIR)/service/juci-eventd $(1)/sbin/
endef
