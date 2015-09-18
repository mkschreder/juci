define Plugin/juci-event/install 
	$(INSTALL_DIR) $(1)/etc/init.d/
	$(INSTALL_DIR) $(1)/sbin
	$(INSTALL_DIR) $(1)/etc/hotplug.d/
	$(CP) hotplug/* $(1)/etc/hotplug.d/
	chmod +x ./service/*
	$(CP) ./service/juci-eventd $(1)/sbin/
	$(CP) ./service/juci-eventd.init $(1)/etc/init.d/juci-eventd
endef
