include $(TOPDIR)/rules.mk

PKG_NAME:=juci-example-standalone
PKG_VERSION:=0.0.1
PKG_RELEASE:=$(PKG_VERSION)
PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)
PKG_BUILD_DEPENDS := juci 

include $(INCLUDE_DIR)/package.mk

define Package/juci-example-standalone
    SECTION:=juci
    CATEGORY:=JUCI
    TITLE:=JUCI Standalone Plugin Example
    URL:=https://github.com/mkschreder/juci
    MAINTAINER:=Martin K. Schröder <mkschreder.uk@gmail.com>
    SUBMENU:=Plugins
endef
    
define Package/juci-example-standalone/description
	An example showing how to build standalone plugin packages in juci.  
endef 

define Package/juci-example-standalone/config
	depends on PACKAGE_juci
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	$(CP) ./src/* $(PKG_BUILD_DIR)/
endef

define Build/Compile
	make -C $(STAGING_DIR)/usr/src/juci/ MODULE=$(PKG_BUILD_DIR)
endef

define Package/juci-example-standalone/install
	$(CP) $(PKG_BUILD_DIR)/bin/* $(1)/
endef

define Package/juci-example-standalone/postinst
#!/bin/sh
# run this only during image building stage
[ -n "$${IPKG_INSTROOT}" ] && $${STAGING_DIR}/usr/src/juci/juci-update $${IPKG_INSTROOT}/www/
# otherwise just run normal version
[ -z "$${IPKG_INSTROOT}" ] && juci-update
exit 0
endef

$(eval $(call BuildPackage,juci-example-standalone))
