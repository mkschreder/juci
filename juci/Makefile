BUILD_DIR:=build
OUTDIR:=$(BUILD_DIR)/www/
CSS:=$(OUTDIR)/css/01-juci.css
JS:=$(OUTDIR)/js/01-juci.js
JSLIB:=$(OUTDIR)/js/00-juci-libs.js
HTML:=$(OUTDIR)/js/01-juci-tpl.js
CP:=cp -Rp
INSTALL_DIR=mkdir -p

STYLES:=
STYLES+=src/css/normalize.css
STYLES+=src/lib/css/bootstrap.min.css
STYLES+=src/lib/css/bootstrap-select.min.css
STYLES+=src/lib/css/font-awesome.min.css
STYLES+=src/lib/css/ionicons.min.css
STYLES+=src/lib/css/angular-ui.min.css
STYLES+=src/lib/css/select.min.css
STYLES+=src/lib/css/angular-ui-switch.min.css
STYLES+=src/lib/css/awesome-bootstrap-checkbox.css
STYLES+=src/lib/css/vis.min.css
STYLES+=src/css/nga.min.css
STYLES+=src/css/app.css

JSLIBS:=
JSLIBS+=src/lib/js/async.js
JSLIBS+=src/lib/js/vis.js
JSLIBS+=src/lib/js/js-schema.min.js
JSLIBS+=src/lib/js/require.js
JSLIBS+=src/lib/js/jquery.min.js
JSLIBS+=src/lib/js/cytoscape.min.js
JSLIBS+=src/lib/js/bootstrap.min.js
JSLIBS+=src/lib/js/angular.min.js
JSLIBS+=src/lib/js/angular-ui.min.js
JSLIBS+=src/lib/js/angular-ui-router.min.js
JSLIBS+=src/lib/js/angular-gettext.min.js
JSLIBS+=src/lib/js/angular-prompt.js
JSLIBS+=src/lib/js/bootstrap-select.min.js
JSLIBS+=src/lib/js/select.min.js
JSLIBS+=src/lib/js/angular-animate.min.js
JSLIBS+=src/lib/js/angular-drag-and-drop-lists.js
JSLIBS+=src/lib/js/angular-ui-bootstrap-juci.min.js
JSLIBS+=src/lib/js/jquery-jsonrpc.js
#JAVASCRIPT+=src/lib/js/translations.js
JSLIBS+=src/lib/js/angular-ui-switch.min.js
JSLIBS+=src/lib/js/angular-modal-service.min.js
JSLIBS+=src/lib/js/angular-checklist-model.js

JAVASCRIPT:=
JAVASCRIPT+=src/js/compat.js
JAVASCRIPT+=src/js/rpc.js
JAVASCRIPT+=src/js/uci.js
JAVASCRIPT+=src/js/juci.js
JAVASCRIPT+=src/js/app.js
JAVASCRIPT+=src/js/localStorage.js
JAVASCRIPT+=src/js/config.js
JAVASCRIPT+=src/js/navigation.js
JAVASCRIPT+=src/js/status.js
JAVASCRIPT+=src/js/tr.js
JAVASCRIPT+=src/js/theme.js
JAVASCRIPT+=src/js/timeout.js
JAVASCRIPT+=$(wildcard src/widgets/*.js) $(wildcard src/pages/*.js)

INDEX:=$(OUTDIR)/index.html
TEMPLATES:=$(wildcard src/html/*.html) $(wildcard src/widgets/*.html) $(wildcard src/pages/*.html)
JUCI_TEMPLATE_CC:=../juci-build-tpl-cache

all: $(OUTDIR) files $(CSS) $(JSLIB) $(JS) $(HTML)
	cat $(HTML) >> $(JS)
	rm -f $(HTML)

$(OUTDIR): 
	mkdir -p $(OUTDIR)

.PHONY: files

files: 
	$(INSTALL_DIR) $(OUTDIR)/css/
	$(INSTALL_DIR) $(OUTDIR)/js/
	$(CP) ./src/img/ $(OUTDIR)/
	$(CP) ./src/fonts/ $(OUTDIR)/
	#$(CP) ./src/index.html $(OUTDIR)/
	# TODO: this needs to be replaced later with /etc/config/juci with proper acl permissions
	$(CP) ./juci.config.json $(OUTDIR)/config.json
	$(INSTALL_DIR) $(BUILD_DIR)/usr/share/lua/
	$(CP) lualibs/* $(BUILD_DIR)/usr/share/lua/
	
	
$(CSS): $(STYLES)
	cat $(STYLES) > $(CSS)

$(JS): $(JAVASCRIPT)
	rm -f $(JS); touch $(JS)
	for file in $(JAVASCRIPT); do echo $$file; cat $$file >> $(JS); echo ';' >> $(JS); done

$(JSLIB): $(JSLIBS)
	rm -f $(JSLIB); touch $(JSLIB)
	for file in $(JSLIBS); do echo $$file; cat $$file >> $(JSLIB); echo ';' >> $(JSLIB); done

$(HTML): $(TEMPLATES)
	$(JUCI_TEMPLATE_CC) $(TEMPLATES) $(HTML)
	
clean: 
	rm -rf htdocs
