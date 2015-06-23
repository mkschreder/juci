DIRS-y:=juci juci-mod-voice juci-mod-wireless juci-mod-tv juci-mod-system juci-mod-status juci-mod-network 
BIN:=bin
UBUS_MODS:=

-include Makefile.local

export JUCI_TEMPLATE_CC=$(shell pwd)/juci-build-tpl-cache 

ifneq ($(CONFIG_JUCI_THEME_SELECTED),y)
	DIRS-y += juci-theme-inteno
endif

ifeq ($(CONFIG_JUCI_THEME_INTENO),y)
	DIRS-y += juci-theme-inteno
endif

ifeq ($(CONFIG_JUCI_MOD_SAMBA),y)
	DIRS-y += juci-mod-samba
endif

ifeq ($(CONFIG_JUCI_UBUS_CORE),y)
	UBUS_MODS += juci-ubus-core
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
	@echo "MODULES: $(DIRS-y)"
	@echo "UBUS: $(UBUS_MODS)"
	mkdir -p $(BIN)/www/
	mkdir -p $(BIN)/usr/share/rpcd/menu.d/
	
node_modules: package.json
	npm install --production
	
inteno: all

debug: $(UBUS_MODS) $(DIRS-y) 
	#npm install 
	#grunt
	./juci-update $(BIN)/www DEBUG

#node_modules: package.json
#	npm install
	
.PHONY: $(DIRS-y) $(UBUS_MODS) prepare
$(DIRS-y): 
	@echo "Building SUBMODULE $@"
	make -C $@
	cp -Rp $@/htdocs/* $(BIN)/www/
	cp -Rp $@/menu.json $(BIN)/usr/share/rpcd/menu.d/$@.json

$(UBUS_MODS): 
	@echo "Building UBUS module $@"
	make -C $@
	cp -Rp $@/build/* $(BIN)/
	
clean: 
	rm -rf ./bin
	for dir in $(DIRS-y); do make -C $$dir clean; rm -rf bin; done
