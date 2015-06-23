#
# Copyright (C) 2013 Jo-Philipp Wich <jow@openwrt.org>
#
# Licensed under the Apache License, Version 2.0.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=ubus-mod-juci
#PKG_VERSION:=$(shell git --git-dir=$(CURDIR)/../.git log -1 --pretty="%ci %h" | awk '{ print $$1 "-" $$4 }')
PKG_VERSION:=15.6.8
PKG_MAINTAINER:=Martin K. Schroder <mkschreder.uk@gmail.com>

PKG_LICENSE:=Apache-2.0
PKG_LICENSE_FILES:=

PKG_BUILD_PARALLEL:=1

include $(INCLUDE_DIR)/package.mk
include $(INCLUDE_DIR)/cmake.mk

define Build/Prepare
	$(INSTALL_DIR) $(PKG_BUILD_DIR)
	$(CP) ./src/* $(PKG_BUILD_DIR)/
endef

define Package/ubus-mod-juci
  SECTION:=ubus-mod-juci
  CATEGORY:=UBUS
  TITLE:=UBUS UCI Plugin
  DEPENDS:=+rpcd +libubox +libubus
endef

define Package/ubus-mod-juci/description
	Provides support for writing lightweight ubus plugins
endef

define Package/ubus-mod-juci/install
	$(INSTALL_DIR) $(1)/usr/lib/rpcd
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/ubus-mod-juci.so $(1)/usr/lib/rpcd/
	$(INSTALL_DIR) $(1)/usr/share/rpcd/acl.d
	$(CP) ./access.json $(1)/usr/share/rpcd/acl.d/ubus-mod-juci.json
	$(INSTALL_DIR) $(1)/usr/libexec $(1)/www/cgi-bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/io/juci-cgi $(1)/usr/libexec/
	$(LN) /usr/libexec/juci-cgi $(1)/www/cgi-bin/juci-upload
	$(LN) /usr/libexec/juci-cgi $(1)/www/cgi-bin/juci-backup
endef

define Package/ubus-mod-juci/postinst
endef

$(eval $(call BuildPackage,ubus-mod-juci))
