//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
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
						'plugins/juci*/src/**/*.js',
						'plugins/juci*/src/**/*.html'
					]
				}
			}
		}, 
		nggettext_compile: {
			all: {
				files: {
					'bin/www/js/99-translations.js': ['po/*.po']
				}
			}
		}, 
		extract_titles: {
			options: {
				files: {
					'po/titles.pot': [
						"bin/usr/share/rpcd/menu.d/*.json"
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
									output.push("msgid \""+obj[k].title+"\""); 
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
	grunt.registerTask("compile_pot", "Compiles all pot files into one template pot", function(){
		var exec = require('child_process').exec;
		var done = this.async(); 
		exec("rm po/juci_all_strings.pot ; for file in po/*pot; do msguniq \"$file\" > po/unique.tmp; mv po/unique.tmp \"$file\"; done ; msgcat po/*.pot | msguniq > po/juci_all_strings.pot; for file in po/*po; do msguniq \"$file\" > po/unique.tmp; msgmerge -U -N po/unique.tmp po/juci_all_strings.pot; mv po/unique.tmp \"$file\"; done", function(){
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
	grunt.registerTask('default', ['nggettext_extract', 'nggettext_compile', "extract_titles", "compile_pot"]);
	
}
