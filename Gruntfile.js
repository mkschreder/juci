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
						'juci*/src/**/*.js',
						'juci*/src/**/*.html'
					]
				}
			}
		}, 
		nggettext_compile: {
			all: {
				files: {
					'htdocs/js/99-translations.js': ['po/*.po']
				}
			}
		}, 
		extract_titles: {
			options: {
				files: {
					'po/titles.pot': [
						"menu.d/*.json"
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
							try {
								var obj = JSON.parse(fs.readFileSync(file)); 
								output.push("# "+file); 
								Object.keys(obj).map(function(k){
									output.push("msgid \""+k.replace(/\//g, ".").replace(/_/g, ".")+".title\""); 
									output.push("msgstr \"\""); 
								});  
							} catch(e){
								console.log("WARNING: failed to process "+file+": "+e); 
							}
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
		var files = grunt.file.expand(["./tests/test-*.js", "./src/**/test-*.js", "./src/**/*.test.js"]); 
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
		var OUTDIR = "htdocs/"; 
		var libfiles = [
			"src/lib/js/async.js",
			"src/lib/js/js-schema.min.js",
			"src/lib/js/require.js",
			"src/lib/js/jquery.min.js",
			"src/lib/js/angular.min.js",
			"src/lib/js/angular-ui.min.js",
			"src/lib/js/angular-ui-router.min.js",
			"src/lib/js/angular-gettext.min.js",
			"src/lib/js/bootstrap-select.min.js",
			"src/lib/js/select.min.js",
			"src/lib/js/angular-animate.min.js",
			"src/lib/js/angular-ui-bootstrap-juci.min.js",
			"src/lib/js/jquery-jsonrpc.js",
			"src/lib/js/translations.js",
			"src/lib/js/bootstrap.min.js",
			"src/lib/js/angular-ui-switch.min.js",
			"src/lib/js/angular-modal-service.min.js",
			"src/lib/js/angular-checklist-model.js"
		]; 
		var appfiles = [
			"src/js/compat.js", 
			"src/js/rpc.js",
			"src/js/uci.js",
			"src/js/juci.js",
			"src/js/app.js",
			"src/js/localStorage.js",
			"src/js/config.js",
			"src/js/navigation.js",
			"src/js/status.js",
			"src/js/tr.js",
			"src/js/theme.js",
			"src/js/timeout.js"
		]; 
		var cssfiles = [
			"src/css/normalize.css",
			"src/lib/css/bootstrap.min.css",
			"src/lib/css/bootstrap-select.min.css",
			"src/lib/css/font-awesome.min.css",
			"src/lib/css/angular-ui.min.css",
			"src/lib/css/select.min.css",
			"src/lib/css/angular-ui-switch.min.css",
			"src/lib/css/awesome-bootstrap-checkbox.css",
			"src/css/nga.min.css",
			"src/css/app.css"
		];
		
		cssfiles = cssfiles.concat(grunt.file.expand(["src/plugins/**/css/*.css", "src/themes/vodafone/css/*.css"]));
		
		var pluginfiles = grunt.file.expand(["src/plugins/**/plugin.json"]); 
		var otherfiles = grunt.file.expand(["./src/plugins/**/*.js", "./src/themes/vodafone/**/*.js"]).filter(function(x){
			return !x.match(/.*\/test-.*\.js/) && !x.match(/.*\.test\.js/); 
		}); 
		var htmlfiles = grunt.file.expand(["src/**/*.html"]); 
		var css = cssfiles.map(function(file){ 
			return String(fs.readFileSync(file)); 
		}).join("\n"); 
		var all = libfiles.concat(appfiles).concat(otherfiles); 
		var templates = {}; var plugins = {}; 
		htmlfiles.map(function(name){
			templates[name.replace("src/", "")] = String(fs.readFileSync(name)); 
		}); 
		pluginfiles.map(function(name){
			plugins[name.replace(/^src\//, "")] = JSON.parse(String(fs.readFileSync(name))); 
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
		//fs.writeFileSync("src/__all.css", css); 
		// TODO: really do not do it in memory!
		fs.writeFileSync(OUTDIR+"__all.js", javascript); 
		//fs.writeFileSync("src/__all.js", javascript); 
		
		//fs.writeFileSync("src/__templates.js", JSON.stringify(templates)); 
	}); 
	grunt.registerTask('default', ['nggettext_extract', 'nggettext_compile', "extract_titles", "compile_pot"]);
	
}
