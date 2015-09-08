TARGET:=$(shell basename $$PWD)
OUTDIR:=build
CSS:=$(OUTDIR)/www/css/50-$(TARGET).css
JS:=$(OUTDIR)/www/js/50-$(TARGET).js
HTML:=$(OUTDIR)/www/js/90-$(TARGET)-tpl.js
CP:=cp -Rp
INSTALL_DIR=mkdir -p

all: files $(OUTDIR) $(JS) $(CSS) $(HTML);
	
$(OUTDIR): 
	mkdir -p $(OUTDIR)
	
.PHONY: files
files: 
	$(INSTALL_DIR) ./$(OUTDIR)/www/css
	$(INSTALL_DIR) ./$(OUTDIR)/www/js
	$(INSTALL_DIR) ./$(OUTDIR)/usr/bin/
	$(INSTALL_DIR) ./$(OUTDIR)/sbin/
	$(INSTALL_DIR) ./$(OUTDIR)/etc/init.d/
	chmod +x ./service/*
	$(CP) ./service/juci-broadcom-wld ./$(OUTDIR)/sbin/
	$(CP) ./service/juci-broadcom-wld.init ./$(OUTDIR)/etc/init.d/juci-broadcom-wld
	
STYLES:=$(wildcard src/css/*.css) 
CODE:=$(wildcard src/*.js) $(wildcard src/pages/*.js src/widgets/*.js)
TEMPLATES:=$(wildcard src/widgets/*.html) $(wildcard src/pages/*.html)

$(CSS): $(STYLES)
	cat $(STYLES) > $@

$(JS): $(CODE)
	cat $(CODE) > $@
	
$(HTML): $(TEMPLATES)
	$(JUCI_TEMPLATE_CC) $(TEMPLATES) $(HTML) 

clean: 
	rm -rf $(OUTDIR)
