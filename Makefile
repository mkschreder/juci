DIRS-y:=juci 
PLUGINS-y:=
BIN:=bin
BACKEND_BIN_DIR:=$(BIN)/usr/lib/ubus/juci/
CODE_DIR:=$(BIN)/www/js
CSS_DIR:=$(BIN)/www/css
TARGETS:=
PHONY:=debug release clean prepare node_modules 
CP:=cp -Rp 
Q:=@
INSTALL_DIR:=mkdir -p

all: release

-include Makefile.local

define Plugin/Default
	CODE_LOAD:=10
	JAVASCRIPT-y:=
	TEMPLATES-y:=
	STYLES-y:=
endef 

define BuildDir 
	$(eval $(call Plugin/Default))
	$(eval CODE_LOAD:=50) # same as LOAD, LOAD is deprecated
	$(eval TPL_LOAD:=90)
	$(eval STYLE_LOAD:=50)
	$(eval JAVASCRIPT-y:=src/*.js src/pages/*.js src/widgets/*.js)
	$(eval TEMPLATES-y:=src/widgets/*.html src/pages/*.html)
	$(eval STYLES-y:=src/css/*.css)
	$(eval PLUGIN_DIR:=$(CURDIR)/$(2)/$(1))
	$(eval -include $(2)/$(1)/Makefile)
	$(eval $(Plugin/$(1)))
	$(eval TARGETS+=$(1)-install $(CODE_DIR)/$(CODE_LOAD)-$(1).js $(CODE_DIR)/$(TPL_LOAD)-$(1).tpl.js $(CSS_DIR)/$(STYLE_LOAD)-$(1).css)
	$(eval JAVASCRIPT_$(1):=$(wildcard $(addprefix $(2)/$(1)/,$(JAVASCRIPT-y))))
	$(eval TEMPLATES_$(1):=$(wildcard $(addprefix $(2)/$(1)/,$(TEMPLATES-y))))
	$(eval STYLES_$(1):=$(wildcard $(addprefix $(2)/$(1)/,$(STYLES-y))))
	PHONY += $(1)-install
$(CODE_DIR)/$(CODE_LOAD)-$(1).js: $(JAVASCRIPT_$(1)) 
	@echo -e "\e[0;33m[JS]\t$(1) -> $$@\e[m"
	@#echo "   * $$^"
	@echo "" > $$@
	$(Q)if [ "" != "$$^" ]; then for file in $$^; do cat $$$$file >> $$@; echo "" >> $$@; done; fi
$(CSS_DIR)/$(STYLE_LOAD)-$(1).css: $(STYLES_$(1))
	@echo -e "\e[0;33m[CSS]\t$(1) -> $$@\e[m"
	@#echo "   * $$(STYLES_$(1))"
	@echo "" > $$@
	$(Q)if [ "" != "$$^" ]; then for file in $$^; do cat $$$$file >> $$@; echo "" >> $$@; done; fi
$(CODE_DIR)/$(TPL_LOAD)-$(1).tpl.js: $(TEMPLATES_$(1))
	@echo -e "\e[0;33m[HTML]\t$(1) -> $$@\e[m"
	@#echo "   * $$^"
	@echo "" > $$@
	$(Q)if [ "" != "$$^" ]; then ./juci-build-tpl-cache $$^ $$@; fi
$(1)-install: 
	$(call Plugin/$(1)/install,$(BIN))
	$(Q)if [ -d $(CURDIR)/$(2)/$(1)/ubus ]; then $(CP) $(CURDIR)/$(2)/$(1)/ubus/* $(BACKEND_BIN_DIR); fi
	@-chmod +x $(BACKEND_BIN_DIR)/* 
	$(Q)if [ -f $(CURDIR)/$(2)/$(1)/menu.json ]; then $(CP) $(CURDIR)/$(2)/$(1)/menu.json $(BIN)/usr/share/rpcd/menu.d/$(1).json; fi
	$(Q)if [ -f $(CURDIR)/$(2)/$(1)/access.json ]; then $(CP) $(CURDIR)/$(2)/$(1)/access.json $(BIN)/usr/share/rpcd/acl.d/$(1).json; fi
endef

define plugin 
ifeq ($(CONFIG_PACKAGE_$(1)),y) 
	$(eval $(call BuildDir,$(1),plugins))
endif
endef

define service 
ifeq ($(CONFIG_PACKAGE_$(1)),y) 
	$(eval $(call BuildDir,$(1),services))
endif
endef

define theme 
ifeq ($(CONFIG_PACKAGE_$(1)),y) 
	$(eval $(call BuildDir,$(1),themes))
endif
endef

define prval
name:=CONFIG_PACKAGE_$(1); 
@echo "VALUE: $(1): $(CONFIG_PACKAGE_$(1))"; 
endef

$(eval $(call BuildDir,juci,./))
$(eval $(call plugin,juci-asterisk)); 
$(eval $(call plugin,juci-broadcom-wl));
$(eval $(call plugin,juci-broadcom-dsl));
$(eval $(call plugin,juci-broadcom-vlan));
$(eval $(call plugin,juci-broadcom-ethernet));
$(eval $(call plugin,juci-network-netifd));
$(eval $(call plugin,juci-firewall-fw3));
$(eval $(call plugin,juci-dnsmasq-dhcp));
$(eval $(call plugin,juci-minidlna));
$(eval $(call plugin,juci-samba));
$(eval $(call plugin,juci-event));
$(eval $(call plugin,juci-ddns));
$(eval $(call plugin,juci-dropbear));
$(eval $(call plugin,juci-diagnostics));
$(eval $(call plugin,juci-inteno-router));
$(eval $(call plugin,juci-upnp));
$(eval $(call plugin,juci-usb));
$(eval $(call plugin,juci-utils));
$(eval $(call plugin,juci-macdb));
$(eval $(call plugin,juci-igmpinfo));
$(eval $(call plugin,juci-mod-system));
$(eval $(call plugin,juci-sysupgrade));
$(eval $(call plugin,juci-mod-status));
$(eval $(call plugin,juci-jquery-console));
$(eval $(call plugin,juci-netmode));
$(eval $(call plugin,juci-natalie-dect));
$(eval $(call plugin,juci-ethernet)); 
$(eval $(call theme,juci-theme-inteno));


UBUS_MODS:= backend/igmpinfo

export CC:=$(CC)
export CFLAGS:=$(CFLAGS)

ifeq ($(DESTDIR),)
	DESTDIR:=/
endif

ifneq ($(SELECT_ALL),)
	DIRS-y += $(wildcard plugins/*)
endif

ifeq ($(CONFIG_PACKAGE_juci-ubus-core),y)
	UBUS_MODS += backend/juci-core
endif

prepare: 	
	@echo "======= JUCI CONFIG ========="
	@echo "TARGETS: $(TARGETS)"
	@echo "BACKEND: $(UBUS_MODS)"
	@mkdir -p $(BIN)/www/js/
	@mkdir -p $(BIN)/www/css/
	@mkdir -p $(BIN)/usr/share/lua/
	@mkdir -p $(BIN)/usr/share/rpcd/menu.d/
	@mkdir -p $(BIN)/usr/share/rpcd/acl.d/
	@mkdir -p $(BACKEND_BIN_DIR)
	@mkdir -p $(BIN)/etc/hotplug.d/
	
node_modules: package.json
	npm install --production

release: prepare $(TARGETS) node_modules $(UBUS_MODS)
	@echo "======= JUCI BUILD =========="
	@./juci-compile 
	@./juci-update $(BIN)/www RELEASE


debug: prepare $(TARGETS) $(UBUS_MODS)
	@echo -e "\e[0;33m [GRUNT] $@ \e[m"
	@grunt 
	@echo -e "\e[0;33m [UPDATE] $@ \e[m"
	@./juci-update $(BIN)/www DEBUG

install: 
	@cp -Rp $(BIN)/* $(DESTDIR)

.PHONY: $(PHONY) $(UBUS_MODS) 

$(UBUS_MODS): 
	@echo "Building UBUS module $@"
	@echo "CFLAGS: $(CFLAGS)"
	@make -i -C $@ clean
	@make -C $@ 
	@cp -Rp $@/build/* $(BIN)/
	
clean: 
	rm -rf ./bin

