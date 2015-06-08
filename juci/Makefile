OUTDIR:=htdocs
CSS:=$(OUTDIR)/css/00-juci.css
JS:=$(OUTDIR)/js/00-juci.js
HTML:=$(OUTDIR)/js/01-juci-tpl.js
CP:=cp -Rp
INSTALL_DIR=mkdir -p

STYLES:=
STYLES+=src/css/normalize.css
STYLES+=src/lib/css/bootstrap.min.css
STYLES+=src/lib/css/bootstrap-select.min.css
STYLES+=src/lib/css/font-awesome.min.css
STYLES+=src/lib/css/angular-ui.min.css
STYLES+=src/lib/css/select.min.css
STYLES+=src/lib/css/angular-ui-switch.min.css
STYLES+=src/lib/css/awesome-bootstrap-checkbox.css
STYLES+=src/css/nga.min.css
STYLES+=src/css/app.css

JAVASCRIPT:=
JAVASCRIPT+=src/lib/js/async.js
JAVASCRIPT+=src/lib/js/js-schema.min.js
JAVASCRIPT+=src/lib/js/require.js
JAVASCRIPT+=src/lib/js/jquery.min.js
JAVASCRIPT+=src/lib/js/angular.min.js
JAVASCRIPT+=src/lib/js/angular-ui.min.js
JAVASCRIPT+=src/lib/js/angular-ui-router.min.js
JAVASCRIPT+=src/lib/js/angular-gettext.min.js
JAVASCRIPT+=src/lib/js/bootstrap-select.min.js
JAVASCRIPT+=src/lib/js/select.min.js
JAVASCRIPT+=src/lib/js/angular-animate.min.js
JAVASCRIPT+=src/lib/js/angular-ui-bootstrap-juci.min.js
JAVASCRIPT+=src/lib/js/jquery-jsonrpc.js
#JAVASCRIPT+=src/lib/js/translations.js
JAVASCRIPT+=src/lib/js/bootstrap.min.js
JAVASCRIPT+=src/lib/js/angular-ui-switch.min.js
JAVASCRIPT+=src/lib/js/angular-modal-service.min.js
JAVASCRIPT+=src/lib/js/angular-checklist-model.js
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

all: $(OUTDIR) files $(CSS) $(JS) $(INDEX) $(HTML);

$(OUTDIR): 
	mkdir $(OUTDIR)

.PHONY: files

files: 
	$(INSTALL_DIR) $(OUTDIR)/css/
	$(INSTALL_DIR) $(OUTDIR)/js/
	$(CP) ./src/img/ $(OUTDIR)/
	$(CP) ./src/fonts/ $(OUTDIR)/
	$(CP) ./src/index.html $(OUTDIR)/
	# TODO: this needs to be replaced later with /etc/config/juci with proper acl permissions
	$(CP) ./juci.config.json $(OUTDIR)/config.json
	
	
$(CSS): $(STYLES)
	cat $(STYLES) > $(CSS)

$(JS): $(JAVASCRIPT)
	rm -f $(JS); touch $(JS)
	for file in $(JAVASCRIPT); do echo $$file; cat $$file >> $(JS); echo ';' >> $(JS); done
	
$(INDEX): src/index.html
	cp $(INDEX) src/index.html

$(HTML): $(TEMPLATES)
	$(JUCI_TEMPLATE_CC) $(TEMPLATES) $(HTML)
	
clean: 
	rm -rf htdocs
