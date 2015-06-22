DIRS-y:=juci juci-mod-voice juci-mod-wireless juci-mod-tv juci-mod-system juci-mod-status juci-mod-network juci-mod-samba
BIN:=bin

export JUCI_TEMPLATE_CC=$(shell pwd)/juci-build-tpl-cache 

ifeq ($(DEFAULT_THEME),y)
	# for now temporarily we build any testing modules here as well
	DIRS-y += juci-theme-inteno juci-mod-samba
endif

all: bin/htdocs bin/menu.d $(DIRS-y)
	./juci-compile
	./juci-update $(BIN)/htdocs RELEASE
	#closure-compiler --warning_level QUIET --language_in ECMASCRIPT5 --compilation_level ADVANCED_OPTIMIZATIONS --js htdocs/__all.js --js_output_file htdocs/__compiled.js
	#yui-compressor htdocs/__all.css > htdocs/__compiled.css
	#mv htdocs/__compiled.css htdocs/__all.css
	#mv htdocs/__compiled.js htdocs/__all.js
	#rm -rf htdocs/js
	#rm -rf htdocs/css

inteno: all
	
debug: $(BIN)/htdocs $(BIN)/menu.d $(DIRS-y)
	#npm install 
	#grunt
	./juci-update $(BIN)/htdocs DEBUG
	
$(BIN)/htdocs: 
	mkdir -p $(BIN)/htdocs

$(BIN)/menu.d: 
	mkdir -p $(BIN)/menu.d 
	
#node_modules: package.json
#	npm install
	
.PHONY: $(DIRS-y)
$(DIRS-y): 
	make -C $@
	cp -Rp $@/htdocs/* $(BIN)/htdocs/
	cp -Rp $@/menu.json $(BIN)/menu.d/$@.json

clean: 
	for dir in $(DIRS-y); do make -C $$dir clean; rm -rf bin; done
