DIRS-y:=juci \
	plugins/juci-asterisk \
	plugins/juci-broadcom-wl \
	plugins/juci-igmpsnoop \
	plugins/juci-broadcom-dsl \
	plugins/juci-broadcom-vlan \
	plugins/juci-network-netifd \
	plugins/juci-firewall-fw3 \
	plugins/juci-dnsmasq-dhcp \
	plugins/juci-mod-system \
	plugins/juci-mod-status \
	plugins/juci-jquery-console
	
BIN:=bin
UBUS_MODS:=

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

ifeq ($(CONFIG_JUCI_BACKEND_OPKG),y)
	UBUS_MODS += backend/juci-opkg
endif

ifeq ($(CONFIG_JUCI_BACKEND_SYSUPGRADE),y)
	UBUS_MODS += backend/juci-sysupgrade
endif

ifeq ($(CONFIG_JUCI_BACKEND_BCM_WIRELESS),y)
	UBUS_MODS += backend/juci-broadcom-wireless
endif

ifeq ($(CONFIG_JUCI_BACKEND_BCM_DSL),y)
	UBUS_MODS += backend/juci-broadcom-dsl
endif


all: prepare node_modules $(UBUS_MODS) $(DIRS-y) 
	@echo "JUCI ubus enabled: $(CONFIG_JUCI_UBUS_CORE)"
	./juci-compile 
	./juci-update $(BIN)/www RELEASE
	#closure-compiler --warning_level QUIET --language_in ECMASCRIPT5 --compilation_level ADVANCED_OPTIMIZATIONS --js htdocs/__all.js --js_output_file htdocs/__compiled.js
	#yui-compressor htdocs/__all.css > htdocs/__compiled.css
	#mv htdocs/__compiled.css htdocs/__all.css
	#mv htdocs/__compiled.js htdocs/__all.js
	#rm -rf htdocs/js
	#rm -rf htdocs/css

prepare: 	
	@echo "======= JUCI Buliding ========="
	printenv
	@echo "MODULES: $(DIRS-y)"
	@echo "UBUS: $(UBUS_MODS)"
	mkdir -p $(BIN)/www/
	mkdir -p $(BIN)/usr/share/rpcd/menu.d/
	
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
	cp -Rp $@/htdocs/* $(BIN)/www/
	cp -Rp $@/menu.json $(BIN)/usr/share/rpcd/menu.d/$(notdir $@).json

$(UBUS_MODS): 
	@echo "Building UBUS module $@"
	@echo "CFLAGS: $(CFLAGS)"
	printenv
	make -i -C $@ clean
	make -C $@ 
	cp -Rp $@/build/* $(BIN)/
	
clean: 
	rm -rf ./bin
	for dir in $(DIRS-y); do make -C $$dir clean; rm -rf bin; done
