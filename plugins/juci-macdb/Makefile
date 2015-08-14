SHARED_DIR:=build/usr/share/macdb/
BIN_DIR:=build/bin/
TARGET:=$(shell basename $$PWD)
OUTDIR:=htdocs
CSS:=$(OUTDIR)/css/50-$(TARGET).css
JS:=$(OUTDIR)/js/50-$(TARGET).js
HTML:=$(OUTDIR)/js/90-$(TARGET)-tpl.js
CP:=cp -Rp
INSTALL_DIR=mkdir -p

all: files $(OUTDIR) ;

$(OUTDIR): 
	mkdir -p $(OUTDIR)
	
.PHONY: files
files: 
	$(INSTALL_DIR) ./$(OUTDIR)/css
	$(INSTALL_DIR) ./$(OUTDIR)/js
	$(INSTALL_DIR) $(SHARED_DIR)
	$(INSTALL_DIR) $(BIN_DIR)
	$(CP) src/macdb.txt $(SHARED_DIR)/db.txt
	$(CP) src/maclookup $(BIN_DIR)/
	
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
