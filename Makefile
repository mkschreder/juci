DIRS-y:=juci \
	plugins/juci-asterisk \
	plugins/juci-broadcom-wl \
	plugins/juci-broadcom-dsl \
	plugins/juci-broadcom-vlan \
	plugins/juci-broadcom-ethernet \
	plugins/juci-network-netifd \
	plugins/juci-firewall-fw3 \
	plugins/juci-dnsmasq-dhcp \
	plugins/juci-minidlna \
	plugins/juci-samba \
	plugins/juci-event \
	plugins/juci-ddns \
	plugins/juci-diagnostics \
	plugins/juci-inteno-router \
	plugins/juci-upnp \
	plugins/juci-usb \
	plugins/juci-macdb \
	plugins/juci-igmpinfo \
	plugins/juci-mod-system \
	plugins/juci-sysupgrade \
	plugins/juci-mod-status \
	plugins/juci-jquery-console \
	services/ueventd 
	
BIN:=bin
UBUS_MODS:= backend/igmpinfo

-include Makefile.local

export JUCI_TEMPLATE_CC=$(shell pwd)/juci-build-tpl-cache 
export CC:=$(CC)
export CFLAGS:=$(CFLAGS)

ifeq  ($(CONFIG_JUCI_THEME_INTENO),y)
	DIRS-y += themes/juci-inteno
endif

ifeq ($(CONFIG_JUCI_MOD_SAMBA),y)
	DIRS-y += plugins/juci-samba
endif

ifeq ($(CONFIG_JUCI_UBUS_CORE),y)
	UBUS_MODS += backend/juci-core
endif

#ifeq ($(CONFIG_JUCI_BACKEND_IPTV),y)
#	UBUS_MODS += backend/igmpinfo
#endif

#ifeq ($(CONFIG_JUCI_BACKEND_OPKG),y)
#	UBUS_MODS += backend/juci-opkg
#endif

#ifeq ($(CONFIG_JUCI_BACKEND_SYSUPGRADE),y)
#	UBUS_MODS += backend/juci-sysupgrade
#endif

#ifeq ($(CONFIG_JUCI_BACKEND_BCM_WIRELESS),y)
#	UBUS_MODS += backend/juci-broadcom-wireless
#endif

#ifeq ($(CONFIG_JUCI_BACKEND_BCM_DSL),y)
#	UBUS_MODS += backend/juci-broadcom-dsl
#endif

#ifeq ($(CONFIG_JUCI_BACKEND_MACDB),y)
#	UBUS_MODS += backend/juci-macdb
#endif

all: prepare node_modules $(UBUS_MODS) $(DIRS-y) 
	@echo "UBUS IGMP: $(CONFIG_JUCI_BACKEND_IPTV)"; 
	@echo "JUCI ubus enabled: $(CONFIG_JUCI_UBUS_CORE)"
	./juci-compile 
	./juci-update $(BIN)/www RELEASE

prepare: 	
	@echo "======= JUCI Buliding ========="
	@echo "MODULES: $(DIRS-y)"
	@echo "UBUS: $(UBUS_MODS)"
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
