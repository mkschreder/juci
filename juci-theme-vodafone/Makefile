TARGET:=juci-theme-vodafone
CSS:=htdocs/css/$(TARGET).css
JS:=htdocs/js/$(TARGET).js
TEMPLATES:=htdocs/js/$(TARGET)-tpl.js
CP:=cp -Rp
INSTALL_DIR=mkdir -p

all: files $(CSS) $(JS) $(TEMPLATES)
	echo "Done!" > /dev/null

.PHONY: files
files: 
	$(INSTALL_DIR) ./htdocs/css
	$(INSTALL_DIR) ./htdocs/js
	$(CP) ./src/img htdocs/
	$(CP) ./src/fonts htdocs/

STYLES:=$(wildcard src/css/*.css) 
CODE:=$(wildcard src/*.js src/widgets/*.js)
HTML:=$(wildcard src/widgets/*.html)

$(CSS): $(STYLES)
	cat $(STYLES) > $@

$(JS): $(CODE)
	cat $(CODE) > $@
	
$(TEMPLATES): $(HTML)
	./build.js $(HTML) $(TEMPLATES)
