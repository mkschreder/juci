DIRS-y:=juci 
PLUGINS-y:=

ifneq ($(MODULE),)
BIN:=$(MODULE)/bin
else
BIN:=bin
endif

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

define BuildDir-y 
	$(eval $(call Plugin/Default))
	$(eval CODE_LOAD:=50) # same as LOAD, LOAD is deprecated
	$(eval TPL_LOAD:=90)
	$(eval STYLE_LOAD:=50)
	$(eval JAVASCRIPT-y:=src/*.js src/pages/*.js src/widgets/*.js)
	$(eval TEMPLATES-y:=src/widgets/*.html src/pages/*.html)
	$(eval STYLES-y:=src/css/*.css)
	$(eval PLUGIN_DIR:=$(2))
	$(eval -include $(2)/Makefile)
	$(eval $(Plugin/$(1)))
	$(eval TARGETS+=$(1)-install $(CODE_DIR)/$(CODE_LOAD)-$(1).js $(CODE_DIR)/$(TPL_LOAD)-$(1).tpl.js $(CSS_DIR)/$(STYLE_LOAD)-$(1).css)
	$(eval JAVASCRIPT_$(1):=$(wildcard $(addprefix $(2)/,$(JAVASCRIPT-y))))
	$(eval TEMPLATES_$(1):=$(wildcard $(addprefix $(2)/,$(TEMPLATES-y))))
	$(eval STYLES_$(1):=$(wildcard $(addprefix $(2)/,$(STYLES-y))))
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
	$(Q)if [ -d $(2)/ubus ]; then $(CP) $(2)/ubus/* $(BACKEND_BIN_DIR); fi
	$(Q)if [ -d $(2)/service ]; then $(CP) $(2)/service/* $(BIN)/usr/lib/ubus-services/; fi
	@-chmod +x $(BACKEND_BIN_DIR)/* 
	$(Q)if [ -f $(2)/menu.json ]; then $(CP) $(2)/menu.json $(BIN)/usr/share/rpcd/menu.d/$(1).json; fi
	$(Q)if [ -f $(2)/access.json ]; then $(CP) $(2)/access.json $(BIN)/usr/share/rpcd/acl.d/$(1).json; fi
endef

ifneq ($(MODULE),)
$(eval $(call BuildDir-y,$(notdir $(MODULE)),$(MODULE)))
else
$(eval $(call BuildDir-$(CONFIG_PACKAGE_juci),juci,$(CURDIR)/juci/))
$(foreach th,$(wildcard plugins/*),$(eval $(call BuildDir-$(CONFIG_PACKAGE_$(notdir $(th))),$(notdir $(th)),$(CURDIR)/plugins/$(notdir $(th)))))
$(foreach th,$(wildcard themes/*),$(eval $(call BuildDir-$(CONFIG_PACKAGE_$(notdir $(th))),$(notdir $(th)),$(CURDIR)/themes/$(notdir $(th)))))
endif

UBUS_MODS:=

export CC:=$(CC)
export CFLAGS:=$(CFLAGS)

ifeq ($(DESTDIR),)
	DESTDIR:=/
endif

ifeq ($(CONFIG_PACKAGE_juci-igmpinfo),y)
	UBUS_MODS += backend/igmpinfo
endif 

ifeq ($(CONFIG_PACKAGE_juci-ubus-core),y)
	UBUS_MODS += backend/juci-core
endif

.cleaned: Makefile Makefile.local Makefile.basic 
	@make clean 
	@touch .cleaned

Makefile.local: ;

prepare: .cleaned	
	@echo "======= JUCI CONFIG ========="
	@echo "TARGETS: $(TARGETS)"
	@echo "BACKEND: $(UBUS_MODS)"
	@echo "DIRS: $(DIRS-y)"
	@echo "MODULE: $(MODULE)"
	@./bootstrap.sh
	@mkdir -p $(BIN)/www/js/
	@mkdir -p $(BIN)/www/css/
	@mkdir -p $(BIN)/usr/share/lua/
	@mkdir -p $(BIN)/usr/share/rpcd/menu.d/
	@mkdir -p $(BIN)/usr/share/rpcd/acl.d/
	@mkdir -p $(BACKEND_BIN_DIR)
	@mkdir -p $(BIN)/usr/lib/ubus-services/
	@mkdir -p $(BIN)/etc/hotplug.d/
	
node_modules: package.json
	npm install --production

release: prepare $(TARGETS) node_modules $(UBUS_MODS)
	@echo "======= JUCI BUILD =========="
	@./juci-compile $(BIN) 
	@if [ "$(CONFIG_PACKAGE_juci)" == "y" ]; then ./juci-update $(BIN)/www RELEASE; fi

debug: prepare $(TARGETS) $(UBUS_MODS)
	@echo -e "\e[0;33m [GRUNT] $@ \e[m"
	@grunt 
	@echo -e "\e[0;33m [UPDATE] $@ \e[m"
	@./juci-update $(BIN)/www DEBUG

DOCS_MD:= README.md $(wildcard juci/docs/*.md docs/*.md plugins/**/docs/*.md) docs/juci.md
DOCS_HTML:= $(patsubst %.md,%.html,$(DOCS_MD)) docs/juci.html
PHONY+=docs  
docs: $(DOCS_HTML) 
	@echo -e "\e[0;33m [DOCS] $@ $^ \e[m"
	@mkdir -p manual/js
	@mkdir -p manual/css
	@cp juci/src/lib/js/bootstrap.min.js manual/js/
	@cp juci/src/lib/css/bootstrap.min.css manual/css/
	@# remove juci generated md file 
	@rm -f docs/juci.md

docs/juci.md: $(wildcard plugins/**/docs/*.md)
	@# for md in $^; do sed -i "/%PLUGINS_TOC%/a [$$(head -n 1 $$md)]($$(basename $${md%.md}))" docs/juci.md; done
	@./scripts/build_docs .

%.html: %.md 
	@echo -e "\e[0;33m[DOC]: $^\e[m"
	@mkdir -p manual
	@ronn --pipe -f $^ > docs/.tmp.ronn
	@cp docs/page.html.tpl docs/.tmp
	@sed -i -e '/%CONTENT%/r docs/.tmp.ronn' -e 's///' docs/.tmp
	@mv docs/.tmp $(addprefix manual/,$(notdir $@)) 
	@rm -f docs/.tmp.ronn

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

