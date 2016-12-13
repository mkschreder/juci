/*global.JSON = require("JSON"); 
global.async = require("async"); 
global.$ = global.jQuery = require("jquery-deferred"); 
global.$.ajax = require("najax"); 
global.async = require("async"); 
global.watch = require("watchjs").watch; 
global.expect = require("expect.js"); 
*/
global.assert = require("assert");
global.async = require("async"); 
global.$ = global.jQuery = require("jquery-deferred"); 
global.UBUS = {
	uci: {
		get: function(params){
			console.log("UCI get");
			var def = $.Deferred();
			setTimeout(function(){
				def.resolve({
					values: {
						".name": "mysection",
						".type": "test",
						field: "foo"
					}
				});
			}, 0);
			return def.promise();
		},
		set: function(params){
			console.log("UCI add");
			var def = $.Deferred();
			setTimeout(function(){
				def.resolve({
				});
			}, 0);
			return def.promise();
		},
		add: function(params){
			console.log("UCI add");
			var def = $.Deferred();
			setTimeout(function(){
				def.resolve({
					section: params["name"] || "unknown"
				});
			}, 0);
			return def.promise();
		}
	}
};

var uci = require("../uci");

UCI.$registerConfig("test");
UCI.test.$registerSectionType("test", {
	"field": { dvalue: "test", type: String }
});


describe("Basic test", function(){
	it("tests the basic function of loading a config", function(done){
		UCI.$sync("test").done(function(){
			done();
		}).fail(function(){
			done(new Error("unable to sync config"));
		});
	});
});

describe("Section operations", function(){
	it("add a new section", function(done){
		UCI.test.$create({
			".name": "mysection",
			".type": "test",
			"field": "value"
		}).done(function(){
			var s = UCI.test["@test"][0];
			assert.equal(s.field.value, "value");
			assert.equal(UCI.test.mysection.field.value, "value");
			done();
		}).fail(function(){
			done(new Error("unable to create section"));
		});
	});

	it("add a new section with invalid type", function(done){
		try {
			UCI.test.$create({
				".name": "mysection",
				".type": "noexist"
			}).done(function(){
				done(new Error("Able to create invlid sections"));
			}).fail(function(){
				done(new Error("unable to create section"));
			});
		} catch(err){
			done();
		}
	});

	it("saves a section", function(done){
		UCI.$save().done(function(){
			done();
		});
	});

	it("modifies a field and then saves a section", function(done){
		UCI.test.mysection.field.value = "newstuff";
		UCI.$save().done(function(){
			done();
		});
	});

});

describe("Field operations", function(){
	it("try setting different values", function(done){
		UCI.test.$create({
			".name": "another",
			".type": "test",
			"field": "value"
		}).done(function(){
			var s = UCI.test["@test"][1];
			assert.equal(s.field.value, "value");
			s.field.value = "me";
			assert.equal(s.field.value, "me");
			assert.equal(s.field.uvalue, "me");
			assert.equal(s.field.dvalue, "test");
			assert.equal(s.field.ovalue, "value");
			done();
		}).fail(function(){
			done(new Error("unable to create section"));
		});
	});
});

