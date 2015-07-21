INSTALL_DIR:=mkdir -p
CP:=cp -R 
BUILD_DIR:=build
MODULE_NAME:=juci-ubus-core

ACL_LIST:=$(BUILD_DIR)/usr/share/rpcd/acl.d/$(MODULE_NAME).json
SHARED_OBJECT:=$(BUILD_DIR)/usr/lib/rpcd/$(MODULE_NAME).so
CGI_SCRIPT:=$(BUILD_DIR)/usr/libexec/rpcd/$(MODULE_NAME)-cgi
CGI_BIN:=$(BUILD_DIR)/www/cgi-bin/

all: src $(SHARED_OBJECT) $(CGI_SCRIPT) $(ACL_LIST)
	$(INSTALL_DIR) $(CGI_BIN)
	ln -sf /usr/libexec/rpcd/$(MODULE_NAME)-cgi $(CGI_BIN)/juci-upload 
	ln -sf /usr/libexec/rpcd/$(MODULE_NAME)-cgi $(CGI_BIN)/juci-backup 

.PHONY: src
src: 
	(cd src; cmake .; make)

clean: 
	(cd src; make -i clean)
	
$(SHARED_OBJECT): 
	$(INSTALL_DIR) $(shell dirname $@)
	$(CP) src/$(MODULE_NAME).so $(shell dirname $@)/
	
$(CGI_SCRIPT):
	$(INSTALL_DIR) $(shell dirname $@)
	$(CP) src/io/juci-cgi $@
	
$(ACL_LIST): access.json
	$(INSTALL_DIR) $(BUILD_DIR)/usr/share/rpcd/acl.d/
	$(CP) access.json $(ACL_LIST)
