TARGET:=$(shell basename $$PWD)
OUTDIR:=build
WWW:=$(OUTDIR)/www/
CSS:=$(WWW)/css/50-$(TARGET).css
JS:=$(WWW)/js/50-$(TARGET).js
HTML:=$(WWW)/js/90-$(TARGET)-tpl.js
CP:=cp -Rp
INSTALL_DIR=mkdir -p

all: files $(WWW) $(JS)  $(HTML);
	
$(WWW): 
	mkdir -p $(WWW)
	
.PHONY: files
files: 
	$(INSTALL_DIR) ./$(WWW)/css
	$(INSTALL_DIR) ./$(WWW)/js
	
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
