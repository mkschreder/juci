CSS:=htdocs/__all.css
JS:=htdocs/__all.js
HTML:=htdocs/index.html
CP:=cp -Rp
INSTALL_DIR=mkdir -p

all: htdocs files node_modules $(CSS) $(JS) $(HTML)
	echo "Done!" > /dev/null

htdocs: 
	mkdir htdocs

.PHONY: files

files: 
	$(CP) ./src/img/ htdocs/
	$(CP) ./src/fonts/ htdocs/
	$(CP) ./src/index.html htdocs/
	$(CP) ./src/config.json htdocs/
	$(INSTALL_DIR) ./htdocs/themes/vodafone/
	$(CP) ./src/themes/vodafone/img ./htdocs/themes/vodafone/
	$(CP) ./src/themes/vodafone/fonts ./htdocs/themes/vodafone/
	
node_modules: package.json
	npm install
	
$(CSS): $(wildcard src/*css) 
	grunt compile

$(JS): $(wildcard src/*js)
	grunt compile
	
$(HTML): $(wildcard src/*html)
	cp src/index.html $(HTML)
	
