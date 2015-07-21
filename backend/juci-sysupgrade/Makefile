INSTALL_DIR:=mkdir -p
CP:=cp -R 
BUILD_DIR:=build
MODULE_NAME:=juci-sysupgrade

ACL_LIST:=$(BUILD_DIR)/usr/share/rpcd/acl.d/$(MODULE_NAME).json
SHARED_OBJECT:=$(BUILD_DIR)/usr/lib/rpcd/$(MODULE_NAME).so

all: src $(SHARED_OBJECT) $(ACL_LIST)

.PHONY: src
src: 
	(cd src; cmake .; make)

clean: 
	(cd src; make -i clean)
	
$(SHARED_OBJECT): 
	$(INSTALL_DIR) $(shell dirname $@)
	$(CP) src/$(MODULE_NAME).so $(shell dirname $@)/
	
$(ACL_LIST): access.json
	$(INSTALL_DIR) $(BUILD_DIR)/usr/share/rpcd/acl.d/
	$(CP) access.json $(ACL_LIST)
