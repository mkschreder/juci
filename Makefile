DIRS-y:=juci 

define plugin 
ifeq($(CONFIG_PACKAGE_$(1)),y) DIRS-y += plugins/$(1); endif
endef

define service 
ifeq($(CONFIG_PACKAGE_$(1)),y) DIRS-y += services/$(1); endif
endef

$(eval $(call plugin, juci-asterisk ));
$(eval $(call plugin, juci-broadcom-wl));
$(eval $(call plugin, juci-broadcom-dsl));
$(eval $(call plugin, juci-broadcom-vlan));
$(eval $(call plugin, juci-broadcom-ethernet));
$(eval $(call plugin, juci-network-netifd));
$(eval $(call plugin, juci-firewall-fw3));
$(eval $(call plugin, juci-dnsmasq-dhcp));
$(eval $(call plugin, juci-minidlna));
$(eval $(call plugin, juci-samba ));
$(eval $(call plugin, juci-event));
$(eval $(call plugin, juci-ddns));
$(eval $(call plugin, juci-diagnostics));
$(eval $(call plugin, juci-inteno-router));
$(eval $(call plugin, juci-upnp));
$(eval $(call plugin, juci-usb));
$(eval $(call plugin, juci-macdb));
$(eval $(call plugin, juci-igmpinfo ));
$(eval $(call plugin, juci-mod-system ));
$(eval $(call plugin, juci-sysupgrade ));
$(eval $(call plugin, juci-mod-status ));
$(eval $(call plugin, juci-jquery-console ));
$(eval $(call plugin, juci-netmode ));
$(eval $(call service, ueventd ));
	
BIN:=bin
UBUS_MODS:= backend/igmpinfo

-include Makefile.local

export JUCI_TEMPLATE_CC=$(shell pwd)/juci-build-tpl-cache 
export CC:=$(CC)
export CFLAGS:=$(CFLAGS)

ifneq  ($(CONFIG_JUCI_THEME_SELECTED),y)
	DIRS-y += themes/juci-inteno
endif

ifeq ($(CONFIG_JUCI_UBUS_CORE),y)
	UBUS_MODS += backend/juci-core
endif

all: prepare node_modules $(UBUS_MODS) $(DIRS-y) 
	@echo "UBUS IGMP: $(CONFIG_JUCI_BACKEND_IPTV)"; 
	@echo "JUCI ubus enabled: $(CONFIG_JUCI_UBUS_CORE)"
	./juci-compile 
	./juci-update $(BIN)/www RELEASE

prepare: 	
	@echo "======= JUCI Buliding ========="
	@echo "CONFIG: $(CONFIG_PACKAGE_juci-ddns)"
	@echo "MODULES: $(DIRS-y)"
	@echo "UBUS: $(UBUS_MODS)"
	-rm -rf $(BIN)
	mkdir -p $(BIN)/www/
	mkdir -p $(BIN)/usr/share/rpcd/menu.d/
	mkdir -p $(BIN)/usr/share/rpcd/acl.d/
	mkdir -p $(BIN)/usr/lib/rpcd/cgi/
	mkdir -p $(BIN)/etc/hotplug.d/
	
node_modules: package.json
	npm install --production
	
inteno: all

debug: prepare $(UBUS_MODS) $(DIRS-y) 
	#npm install 
	grunt 
	./juci-update $(BIN)/www DEBUG

#node_modules: package.json
#	npm install
	
.PHONY: $(DIRS-y) $(UBUS_MODS) prepare
$(DIRS-y): 
	@echo "Building SUBMODULE $@"
	@echo "CFLAGS: $(CFLAGS)"
	make -i -C $@ clean
	make -C $@
	-cp -Rp $@/htdocs/* $(BIN)/www/
	-cp -Rp $@/build/* $(BIN)/
	-cp -Rp $@/backend/* $(BIN)/usr/lib/rpcd/cgi/
	-cp -Rp $@/hotplug.d/* $(BIN)/etc/hotplug.d/
	-cp -Rp $@/menu.json $(BIN)/usr/share/rpcd/menu.d/$(notdir $@).json
	-cp -Rp $@/access.json $(BIN)/usr/share/rpcd/acl.d/$(notdir $@).json
	# fix permissions on binaries if any
	-chmod +x $(BIN)/usr/bin/*
	-chmod +x $(BIN)/usr/lib/rpcd/cgi/*

$(UBUS_MODS): 
	@echo "Building UBUS module $@"
	@echo "CFLAGS: $(CFLAGS)"
	make -i -C $@ clean
	make -C $@ 
	cp -Rp $@/build/* $(BIN)/
	
clean: 
	rm -rf ./bin
	for dir in $(DIRS-y); do make -C $$dir clean; rm -rf bin; done

