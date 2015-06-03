TARGET:=juci-theme-vodafone
CSS:=htdocs/css/$(TARGET).css
JS:=htdocs/js/01-$(TARGET).js
HTML:=htdocs/js/10-$(TARGET)-tpl.js
CP:=cp -Rp
INSTALL_DIR=mkdir -p

all: files $(CSS) $(JS) $(TEMPLATES);

.PHONY: files
files: 
	$(INSTALL_DIR) ./htdocs/css
	$(INSTALL_DIR) ./htdocs/js
	$(CP) ./src/img htdocs/
	$(CP) ./src/fonts htdocs/

STYLES:=$(wildcard src/css/*.css) 
CODE:=$(wildcard src/*.js src/widgets/*.js)
TEMPLATES:=$(wildcard src/widgets/*.html)

$(CSS): $(STYLES)
	cat $(STYLES) > $@

$(JS): $(CODE)
	cat $(CODE) > $@
	
$(HTML): $(TEMPLATES)
	$(JUCI_TEMPLATE_CC) $(TEMPLATES) $(HTML) 

clean: 
	rm -rf htdocs
