var fs = require("fs"); 

var files = fs.readdirSync("./"); 

var dictionary = {}; 
files.filter(function(x){
	return x.match(/^.*csv$/); 
}).map(function(x){
	var lines = String(fs.readFileSync(x)).split("\n").map(function(x){
		return x.split(";").map(function(x){
			return x.replace(/\"/gi, "").replace(/\\/gi, "/");
		});  
	}); 
	var names = lines.shift(); 
	names.map(function(x){
		if(!(x in dictionary)) dictionary[x] = {}; 
	}); 
	lines.map(function(line){
		for(var id = 2; id < names.length; id++){
			var lang = names[id]; 
			if(line[1] != "NA" && line[1] != "")
				dictionary[lang][line[1]] = line[id]; 
		} 
	}); 
	
	//console.log(names); 
}); 
Object.keys(dictionary).map(function(k){
	var lang = dictionary[k]; 
	var text = ""; 
	console.log("Processing "+k+".."); 
	Object.keys(lang).map(function(str){
		text += "msgid \""+str+"\"\n"+"msgstr \""+lang[str]+"\"\n"
	}); 
	fs.writeFileSync(k+".po", text); 
}); 
