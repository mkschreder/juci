DIRS-y:=juci juci-mod-voice juci-mod-wireless juci-mod-system juci-mod-status juci-mod-network juci-theme-vodafone 

export JUCI_TEMPLATE_CC=$(shell pwd)/juci-build-tpl-cache 

all: htdocs menu.d $(DIRS-y);

htdocs: 
	mkdir -p htdocs

menu.d: 
	mkdir -p menu.d 
	
#node_modules: package.json
#	npm install
	
.PHONY: $(DIRS-y)
$(DIRS-y): 
	make -C $@
	cp -Rp $@/htdocs/* htdocs/
	cp -Rp $@/menu.json menu.d/$@.json
	./juci-update htdocs 
	
clean: 
	for dir in $(DIRS-y); do make -C $$dir clean; rm -rf htdocs/; done
