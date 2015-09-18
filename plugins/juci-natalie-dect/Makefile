define Plugin/juci-natalie-dect/install 
	$(INSTALL_DIR) $(1)/sbin/
	$(INSTALL_DIR) $(1)/etc/init.d/
	chmod +x $(PLUGIN_DIR)/service/*
	$(CP) $(PLUGIN_DIR)/service/ubus-dect $(1)/sbin/
	$(CP) $(PLUGIN_DIR)/service/ubus-dect.init $(1)/etc/init.d/ubus-dect
endef 

