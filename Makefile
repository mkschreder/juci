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

all: node_modules bin/htdocs bin/menu.d $(UBUS_MODS) $(DIRS-y) 
	./juci-compile 
	./juci-update $(BIN)/htdocs RELEASE
	#closure-compiler --warning_level QUIET --language_in ECMASCRIPT5 --compilation_level ADVANCED_OPTIMIZATIONS --js htdocs/__all.js --js_output_file htdocs/__compiled.js
	#yui-compressor htdocs/__all.css > htdocs/__compiled.css
	#mv htdocs/__compiled.css htdocs/__all.css
	#mv htdocs/__compiled.js htdocs/__all.js
	#rm -rf htdocs/js
	#rm -rf htdocs/css

node_modules: package.json
	npm install --production
	
inteno: all

debug: $(BIN)/htdocs $(BIN)/menu.d $(UBUS_MODS) $(DIRS-y) 
	#npm install 
	#grunt
	./juci-update $(BIN)/htdocs DEBUG
	
$(BIN)/htdocs: 
	mkdir -p $(BIN)/htdocs

$(BIN)/menu.d: 
	mkdir -p $(BIN)/menu.d 
	
#node_modules: package.json
#	npm install
	
.PHONY: $(DIRS-y) $(UBUS_MODS)
$(DIRS-y): 
	@echo "Building SUBMODULE $@"
	make -C $@
	cp -Rp $@/htdocs/* $(BIN)/htdocs/
	cp -Rp $@/menu.json $(BIN)/menu.d/$@.json

$(UBUS_MODS): 
	@echo "Building UBUS module $@"
	make -C $@
	
clean: 
	for dir in $(DIRS-y); do make -C $$dir clean; rm -rf bin; done
