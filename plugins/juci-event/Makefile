define Plugin/juci-event/install 
	$(INSTALL_DIR) $(1)/etc/init.d/
	$(INSTALL_DIR) $(1)/sbin
	$(INSTALL_DIR) $(1)/etc/hotplug.d/
	$(CP) $(PLUGIN_DIR)/hotplug/* $(1)/etc/hotplug.d/
	chmod +x $(PLUGIN_DIR)/service/*
	$(CP) $(PLUGIN_DIR)/service/juci-eventd $(1)/sbin/
	$(CP) $(PLUGIN_DIR)/service/juci-eventd.init $(1)/etc/init.d/juci-eventd
endef
