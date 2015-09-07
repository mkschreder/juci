TARGET:=$(shell basename $$PWD)
OUTDIR:=build
SBIN:=$(OUTDIR)/sbin/
CSS:=$(OUTDIR)/www/css/50-$(TARGET).css
JS:=$(OUTDIR)/www/js/50-$(TARGET).js
HTML:=$(OUTDIR)/www/js/90-$(TARGET)-tpl.js
CP:=cp -Rp
INSTALL_DIR=mkdir -p

all: files $(OUTDIR) $(JS);
	
$(OUTDIR): 
	mkdir -p $(OUTDIR)
	
.PHONY: files
files: 
	$(INSTALL_DIR) ./$(OUTDIR)/www/css
	$(INSTALL_DIR) ./$(OUTDIR)/www/js
	$(INSTALL_DIR) ./$(OUTDIR)/etc/init.d/
	$(INSTALL_DIR) $(SBIN)
	$(INSTALL_DIR) $(OUTDIR)/etc/hotplug.d/
	$(CP) hotplug/* $(OUTDIR)/etc/hotplug.d/
	chmod +x ./service/*
	$(CP) ./service/juci-eventd ./$(OUTDIR)/sbin/
	$(CP) ./service/juci-eventd.init ./$(OUTDIR)/etc/init.d/juci-eventd
	
#STYLES:=$(wildcard src/css/*.css) 
CODE:=$(wildcard src/*.js) $(wildcard src/pages/*.js src/widgets/*.js)
TEMPLATES:=$(wildcard src/widgets/*.html) $(wildcard src/pages/*.html)

#$(CSS): $(STYLES)
#	cat $(STYLES) > $@

$(JS): $(CODE)
	cat $(CODE) > $@

$(HTML): $(TEMPLATES)
	$(JUCI_TEMPLATE_CC) $(TEMPLATES) $(HTML) 

clean: 
	rm -rf $(OUTDIR)
