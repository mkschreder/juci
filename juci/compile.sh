LIBFILES=(htdocs/lib/js/async.js htdocs/lib/js/js-schema.min.js htdocs/lib/js/require.js htdocs/lib/js/jquery.min.js htdocs/lib/js/angular.min.js htdocs/lib/js/angular-ui.min.js htdocs/lib/js/angular-ui-router.min.js htdocs/lib/js/angular-gettext.min.js htdocs/lib/js/bootstrap-select.min.js htdocs/lib/js/select.min.js htdocs/lib/js/angular-animate.min.js htdocs/lib/js/angular-ui-bootstrap-juci.min.js htdocs/lib/js/jquery-jsonrpc.js htdocs/lib/js/translations.js htdocs/lib/js/bootstrap.min.js htdocs/lib/js/angular-ui-switch.min.js htdocs/lib/js/angular-modal-service.min.js htdocs/lib/js/angular-checklist-model.js)
PLUGINFILES=$(find htdocs/plugins -type f -name "*js" | grep -v "test-" | grep -v ".test.js" | grep -v ".notest.js")
THEMEFILES=$(find htdocs/themes -type f -name "*js" | grep -v "test-" | grep -v ".test.js" | grep -v ".notest.js")
COREFILES=(htdocs/js/rpc.js htdocs/js/uci.js htdocs/js/juci.js htdocs/js/app.js htdocs/js/localStorage.js htdocs/js/config.js htdocs/js/navigation.js htdocs/js/status.js htdocs/js/session.js htdocs/js/tr.js htdocs/js/theme.js htdocs/js/timeout.js)
FILES=("${LIBFILES[@]}" "${COREFILES[@]}" "${PLUGINFILES[@]}" "${THEMEFILES[@]}"); 

echo "var JUCI_COMPILED = 1;" > htdocs/__all.js
for file in ${FILES[@]}; do
	echo "\"$file\","
done; 

for file in ${FILES[@]}; do
	#echo "FILE: $file"; 
	echo ";" >> htdocs/__all.js; 
	cat $file >> htdocs/__all.js; 
done; 

HTMLFILES=$(find htdocs -type f -name "*html"|grep -v "index.html" | grep -v "__all.html")

echo "" > htdocs/__all.html
for file in ${HTMLFILES[@]}; do
	file=$(echo $file | sed 's/htdocs\///gi')
	echo "HTML: $file"; 
	echo "<script type='text/ng-template' id='/$file'>" >> htdocs/__all.html; 
	cat htdocs/$file >> htdocs/__all.html; 
	echo '</script>' >> htdocs/__all.html;
done; 
