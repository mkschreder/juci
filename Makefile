DIRS-y:=juci juci-theme-vodafone

export JUCI_TEMPLATE_CC=$(shell pwd)/juci-build-tpl-cache 

all: htdocs node_modules $(DIRS-y);

htdocs: 
	mkdir -p htdocs


node_modules: package.json
	npm install
	
.PHONY: $(DIRS-y)
$(DIRS-y): 
	make -C $@
	cp -Rp $@/htdocs/* htdocs/
	./juci-update htdocs 
	
clean: 
	for dir in $(DIRS-y); do make -C $$dir clean; rm -rf htdocs/; done
