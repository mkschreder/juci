define Plugin/juci-network-netifd/install 
	@$(INSTALL_DIR) $(1)/www/img
	@$(INSTALL_DIR) $(1)/usr/lib/rpcd/cgi/
	@$(INSTALL_DIR) $(1)/usr/bin/
	@$(INSTALL_DIR) $(1)/sbin/
	@$(INSTALL_DIR) $(1)/etc/init.d/
	@$(CP) src/images/* ./$(1)/www/img/
	@chmod +x ./service/*
	@$(CP) ./service/juci-netdevd ./$(1)/sbin/
	@$(CP) ./service/juci-netdevd.init ./$(1)/etc/init.d/juci-netdevd
endef
