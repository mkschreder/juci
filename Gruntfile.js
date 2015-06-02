module.exports = function(grunt){
	var glob = require("glob"); 
	var async = require("async"); 
	var fs = require("fs"); 
	var uglifyjs = require("uglify-js"); 
	
	grunt.loadNpmTasks('grunt-angular-gettext'); 
	grunt.initConfig({
		nggettext_extract: {
			pot: {
				files: {
					'po/template.pot': [
						'js/*.js',
						'htdocs/plugins/**/*.html', 
						'htdocs/plugins/**/*.js', 
						'htdocs/themes/**/*.html', 
						'htdocs/themes/**/*.js']
				}
			}
		}, 
		nggettext_compile: {
			all: {
				files: {
					'htdocs/lib/js/translations.js': ['po/*.po']
				}
			}
		}, 
		extract_titles: {
			options: {
				files: {
					'po/titles.pot': [
						"share/menu.d/*.json", 
						"htdocs/plugins/**/menu.json"
					]
				}
			}
		}
	}); 
	grunt.registerTask("extract_titles", 'Extracts titles from menu files', function(arg){
		console.log(JSON.stringify(this.options())+" "+arg);
		var opts = this.options(); 
		var done = this.async(); 
		if(opts.files){
			async.eachSeries(Object.keys(opts.files), function(file, next){
				var output = [];
				async.eachSeries(opts.files[file], function(pattern, next){
					glob(pattern, null, function(err, files){
						console.log(JSON.stringify(files)); 
						files.map(function(file){
							var obj = JSON.parse(fs.readFileSync(file)); 
							output.push("# "+file); 
							Object.keys(obj).map(function(k){
								output.push("msgid \""+k.replace(/\//g, ".")+".title\""); 
								output.push("msgstr \"\""); 
							});  
						}); 
						next(); 
					}); 
				}, function(err){
					//console.log("Writing file: "+file+" "+output.join("\n")); 
					fs.writeFileSync(file, output.join("\n")); 
					next(); 
				}); 
			}, function(){
				done(); 
			}); 
		}
		// combine all menu files we have locally
		/*fs.readdir("share/menu.d", function(err, files){
			files.map(function(file){
				var obj = JSON.parse(fs.readFileSync("share/menu.d/"+file)); 
				Object.keys(obj).map(function(k){
					menu[k] = obj[k]; 
				});  
			}); 
			next({
				menu: menu
			}); 
		}); */
	}); 
	grunt.registerTask("compile_pot", "Compiles all pot files into one 'all.pot'", function(){
		var exec = require('child_process').exec;
		var done = this.async(); 
		exec("rm po/all.pot ; msgcat po/*.pot > po/all.pot", function(){
			done(); 
		}); 
	}); 
	grunt.registerTask("test", "Run all tests using mocha", function(){
		var files = grunt.file.expand(["./tests/test-*.js", "./htdocs/**/test-*.js", "./htdocs/**/*.test.js"]); 
		console.log("Will run tests: "+files); 
		var done = this.async(); 
		var spawn = require('child_process').spawn;
		spawn('mocha', files.concat(['--host', grunt.option("host"), "--user", grunt.option("user"), "--pass", grunt.option("pass")]), { customFds: [0,1,2] })
		.on("exit", function(code){
			if(code != 0 && !grunt.option("ignore-errors")) throw new Error("A test has failed. To run all tests without exiting, specify --ignore-errors option"); 
			else done(); 
		}); 
		console.log(files); 
	});
	grunt.registerTask("compile", "Compile all files into a single file", function(){
		var OUTDIR = "bin/"; 
		var libfiles = [
			"htdocs/lib/js/async.js",
			"htdocs/lib/js/js-schema.min.js",
			"htdocs/lib/js/require.js",
			"htdocs/lib/js/jquery.min.js",
			"htdocs/lib/js/angular.min.js",
			"htdocs/lib/js/angular-ui.min.js",
			"htdocs/lib/js/angular-ui-router.min.js",
			"htdocs/lib/js/angular-gettext.min.js",
			"htdocs/lib/js/bootstrap-select.min.js",
			"htdocs/lib/js/select.min.js",
			"htdocs/lib/js/angular-animate.min.js",
			"htdocs/lib/js/angular-ui-bootstrap-luci.min.js",
			"htdocs/lib/js/jquery-jsonrpc.js",
			"htdocs/lib/js/translations.js",
			"htdocs/lib/js/bootstrap.min.js",
			"htdocs/lib/js/angular-ui-switch.min.js",
			"htdocs/lib/js/angular-modal-service.min.js",
			"htdocs/lib/js/angular-checklist-model.js"
		]; 
		var appfiles = [
			"htdocs/js/compat.js", 
			"htdocs/js/rpc.js",
			"htdocs/js/uci.js",
			"htdocs/js/juci.js",
			"htdocs/js/app.js",
			"htdocs/js/localStorage.js",
			"htdocs/js/config.js",
			"htdocs/js/navigation.js",
			"htdocs/js/status.js",
			"htdocs/js/tr.js",
			"htdocs/js/theme.js",
			"htdocs/js/timeout.js"
		]; 
		var cssfiles = [
			"htdocs/css/normalize.css",
			"htdocs/lib/css/bootstrap.min.css",
			"htdocs/lib/css/bootstrap-select.min.css",
			"htdocs/lib/css/font-awesome.min.css",
			"htdocs/lib/css/angular-ui.min.css",
			"htdocs/lib/css/select.min.css",
			"htdocs/lib/css/angular-ui-switch.min.css",
			"htdocs/lib/css/awesome-bootstrap-checkbox.css",
			"htdocs/css/nga.min.css",
			"htdocs/css/app.css"
		];
		
		cssfiles = cssfiles.concat(grunt.file.expand(["htdocs/plugins/**/css/*.css", "htdocs/themes/vodafone/css/*.css"]));
		
		var pluginfiles = grunt.file.expand(["htdocs/plugins/**/plugin.json"]); 
		var otherfiles = grunt.file.expand(["./htdocs/plugins/**/*.js", "./htdocs/themes/vodafone/**/*.js"]).filter(function(x){
			return !x.match(/.*\/test-.*\.js/) && !x.match(/.*\.test\.js/); 
		}); 
		var htmlfiles = grunt.file.expand(["htdocs/**/*.html"]); 
		var css = cssfiles.map(function(file){ 
			return String(fs.readFileSync(file)); 
		}).join("\n"); 
		var all = libfiles.concat(appfiles).concat(otherfiles); 
		var templates = {}; var plugins = {}; 
		htmlfiles.map(function(name){
			templates[name.replace("htdocs/", "")] = String(fs.readFileSync(name)); 
		}); 
		pluginfiles.map(function(name){
			plugins[name.replace(/^htdocs\//, "")] = JSON.parse(String(fs.readFileSync(name))); 
		}); 
		if(!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR); 
		var javascript = "var JUCI_COMPILED = 1; var JUCI_TEMPLATES = "+
			JSON.stringify(templates)+";"+
			"var JUCI_PLUGINS = "+JSON.stringify(plugins)+";"+
			all.map(function(name){ 
				return fs.readFileSync(name); 
			})
			.join(";\n"); 
			
		fs.writeFileSync(OUTDIR+"__all.css", css); 
		fs.writeFileSync("htdocs/__all.css", css); 
		// TODO: really do not do it in memory!
		fs.writeFileSync(OUTDIR+"__all.js", javascript); 
		fs.writeFileSync("htdocs/__all.js", javascript); 
		
		//fs.writeFileSync("htdocs/__templates.js", JSON.stringify(templates)); 
	}); 
	grunt.registerTask('default', ['nggettext_extract', 'nggettext_compile', "extract_titles", "compile_pot"]);
	
}
