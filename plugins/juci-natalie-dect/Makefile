define Package/juci-natalie-dect/install 
	$(INSTALL_DIR) $(1)/sbin/
	$(INSTALL_DIR) $(1)/etc/init.d/
	chmod +x ./service/*
	$(CP) ./service/ubus-dect $(1)/sbin/
	$(CP) ./service/ubus-dect.init $(1)/etc/init.d/ubus-dect
endef 

