TARGET:=$(shell basename $$PWD)
OUTDIR:=htdocs
CSS:=$(OUTDIR)/css/50-$(TARGET).css
JS:=$(OUTDIR)/js/50-$(TARGET).js
HTML:=$(OUTDIR)/js/90-$(TARGET)-tpl.js
CP:=cp -Rp
INSTALL_DIR=mkdir -p

all: files $(OUTDIR) $(JS) $(HTML);
	
$(OUTDIR): 
	mkdir -p $(OUTDIR)
	
.PHONY: files
files: 
	$(INSTALL_DIR) ./$(OUTDIR)/css
	$(INSTALL_DIR) ./$(OUTDIR)/js

STYLES:=$(wildcard src/css/*.css) 
CODE:=$(wildcard src/*.js) $(wildcard src/widgets/*.js) $(wildcard src/pages/*.js)
TEMPLATES:=$(wildcard src/widgets/*.html) $(wildcard src/pages/*.html) 

$(CSS): $(STYLES)
	@cat $(STYLES) > $@

$(JS): $(CODE)
	@cat $(CODE) > $@

$(HTML): $(TEMPLATES)
	@$(JUCI_TEMPLATE_CC) $(TEMPLATES) $(HTML) 

clean: 
	@rm -rf $(OUTDIR)
