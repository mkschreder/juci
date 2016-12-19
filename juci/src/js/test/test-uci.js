/**
 * This is a unit test for uci module.
 *
 * Author: Martin Schröder <mkschreder.uk@gmail.com>
 *
 * This test attempts to test most of the uci module. Get coverage by running
 * tests from parent directory like this: 
 *
 * istanbul cover _mocha -- -u exports -R tap
 */

// simulated config database 
var CONFIG = {
	test: {
		"default": {
			".type": "test",
			".name": "default",
			"field": "value",
			"array": "juststring",
			"uniquearray": [0, 1, 2],
			"number": null,
			"ip4field": undefined
		},
		"hidden": {
			".type": "test",
			".name": "hidden",
			"field": "hidden",
			"juci_hide": "true"
		},
		"defsec": {
			".type": "test",
			".name": "defsec",
			"field": "abradefault",
			"string": "strdefault",
		},
		"notype": {
			".name": "notype",
			"field": "value"
		},
		"noname": {
			"field": "value"
		}
	}
};

global.gettext = function(str) { return str; }
global.assert = require("assert");
global.async = require("async"); 
global.$ = global.jQuery = require("jquery-deferred"); 

// this is so that we can test code paths that check for absense of RPC object
// we will later assign this to global.UBUS
var _RPC = {
	uci: {
		get_count: 0,
		get: function(params){
			console.log("UCI get");
			this.get_count++;
			var def = $.Deferred();
			setTimeout(function(){
				var conf = CONFIG[params.config];
				if(conf && !params.section){
					def.resolve({
						values: conf
					});
				} else if(conf && params.section && conf[params.section]){
					def.resolve({
						values: conf[params.section]	
					});
				} else {
					def.reject();
				}
			}, 0);
			return def.promise();
		},
		set: function(params){
			console.log("UCI set");
			var def = $.Deferred();
			setTimeout(function(){
				if(!params.config || !params.section || !params.values) {
					console.error("RPC: INVALID PARAMETERS TO UCI SET! "+JSON.stringify(params));
					def.reject();
					return;
				} 
				var conf = CONFIG[params.config];
				if(conf && conf[params.section]){
					var s = conf[params.section];
					Object.keys(params.values).map(function(x){
						s[x] = params.values[x];
					});
					def.resolve({});
				} else {
					def.reject();
				}
			}, 0);
			return def.promise();
		},
		add: function(params){
			console.log("UCI ADD: "+JSON.stringify(params));
			var def = $.Deferred();
			setTimeout(function(){
				if(!params.config || !params.type) {
					console.error("INVALID ARGUMENTS TO UCI.add!");
					def.reject();
					return;
				}
				var conf = CONFIG[params.config];
				if(conf && conf[params["name"]] != undefined){
					console.error("SECTION ALREADY EXISTS");
					def.reject();
				} else {
					var name = (params.name)?params.name:String((new Date()).getTime());
					var obj = {};
					Object.keys(params.values).map(function(x){
						obj[x] = params.values[x];
					});
					obj[".name"] = name;
					obj[".type"] = params.type;
					conf[name] = obj;
					def.resolve({
						section: name
					});
				}
			}, 0);
			return def.promise();
		},
		delete: function(params){
			console.log("UCI delete");
			var def = $.Deferred();
			delete CONFIG[params.config][params.section];
			setTimeout(function(){
				def.resolve({});
			}, 0);
			return def.promise();
		},
		configs: function(){
			console.log("UCI configs");
			var def = $.Deferred();
			setTimeout(function(){
				def.resolve({
					configs: Object.keys(CONFIG).concat(["unknownconf", "someother"])
				});
			}, 0);
			return def.promise();
		},
		order: function(opts){
			console.log("ORDER: "+JSON.stringify(opts));
			var def = $.Deferred();
			setTimeout(function(){
				def.resolve({});
			}, 0);
			return def.promise();
		}
	}
};

require("../uci");

var InvalidValidator = function(){} // this is just a dummy invalid validator

UCI.$registerConfig("test");
// this will simply fail
UCI.$registerConfig("test");

UCI.test.$registerSectionType("anontype", {
	"field": { dvalue: "test", type: String },
	"string": { dvalue: "test", type: String },
});

// make sure that defaults are set to something other than empty value just so we can unit test what happens when value is set to empty
UCI.test.$registerSectionType("test", {
	"field": { dvalue: "test", type: String },
	"string": { dvalue: "test", type: String },
	"number": { dvalue: 3.14, type: Number },
	"array": { dvalue: ["mydefault"], type: Array },
	"ip4field": { dvalue: "test", type: String, validator: UCI.validators.IP4AddressValidator },
	"time": { dvalue: "00:00", type: String, validator: UCI.validators.TimeValidator },
	"timespan": { dvalue: "00:00-01:00", type: String, validator: UCI.validators.TimespanValidator },
	"weekdays": { dvalue: ["Wed"], type: Array, validator: UCI.validators.WeekDayListValidator },
	"portrange": { dvalue: "100-300", type: String, validator: UCI.validators.PortValidator },
	"minmax": { dvalue: "94", type: Number, validator: UCI.validators.NumberLimitValidator(0, 100) },
	"multicast": { dvalue: "225.0.0.0", type: String, validator: UCI.validators.IP4MulticastAddressValidator },
	"unicast": { dvalue: "192.168.123.1", type: String, validator: UCI.validators.IP4UnicastAddressValidator },
	"ip4cidr": { dvalue: "192.168.123.1", type: String, validator: UCI.validators.IP4CIDRValidator },
	"ip": { dvalue: "192.168.123.1", type: String, validator: UCI.validators.IPAddressValidator },
});
// split definition into two parts since we do support this (if duplicate keys appear then they will be replaced!)
UCI.test.$registerSectionType("test", {
	"ipcidr": { dvalue: "192.168.123.1", type: String, validator: UCI.validators.IPCIDRAddressValidator },
	"ip4mask": { dvalue: "255.0.0.0", type: String, validator: UCI.validators.IP4NetmaskValidator },
	"mac": { dvalue: "aa:bb:cc:dd:ee:ff", type: String, validator: UCI.validators.MACAddressValidator },
	"maclist": { dvalue: [], type: Array, validator: UCI.validators.MACListValidator },
	"iparray": { dvalue: [], type: Array, validator: UCI.validators.ArrayValidator(UCI.validators.IP4AddressValidator) },
	"uniqueiparray": { dvalue: [], type: Array, validator: UCI.validators.ArrayValidator(UCI.validators.IP4AddressValidator, true) },
	"uniquearray": { dvalue: [], type: Array, validator: UCI.validators.ArrayValidator(String, true) },
	"uniquenumarr": { dvalue: [], type: Array, validator: UCI.validators.ArrayValidator(Number, true) },
	"uniqueboolarr": { dvalue: [], type: Array, validator: UCI.validators.ArrayValidator(Boolean, true) },
	"invarray": { dvalue: ["foo","bar"], type: Array, validator: UCI.validators.ArrayValidator(InvalidValidator) },
	"bool": { dvalue: false, type: Boolean },
	"boolnodval": { type: Boolean },
	"boolyesno": { dvalue: "yes", type: Boolean },
	"boolonoff": { dvalue: "on", type: Boolean },
	"booltf": { dvalue: "true", type: Boolean },
	"nodefault": { type: Boolean },
	// invalid combinations
	// invalid type and validator combination
	"invarr": { dvalue: "", type: String, validator: UCI.validators.ArrayValidator(String, true) },
	"invarrdnull": { dvalue: null, type: Array, validator: UCI.validators.ArrayValidator(String, true) },
	"invarrnull": { dvalue: "", type: null, validator: UCI.validators.ArrayValidator(String, true) },
	"invnotype": { },
	"invarritem": { dvalue: [], type: Array, validator: UCI.validators.ArrayValidator(123, true) },
	// invalid validator (not a function)
	"invval": { dvalue: [], type: String, validator: {"test":"bar"} },
});

UCI.test.$insertDefaults("test", "defsec");
UCI.test.$insertDefaults("test");

describe("check no rpc", function(){
	it("must work even without rpc module by graciously failing", function(done){
		async.series([
			function(next){
				UCI.$init().done(function(){ assert(false); }).always(function(){
					next();
				});
			},
			function(next){
				UCI.$sync("test").done(function(){ assert(false); }).always(function(){
					next();
				});
			},
			function(next){
				UCI.$save("test").done(function(){ assert(false); }).always(function(){
					next();
				});
			},
			function(next){
				UCI.test.$deleteSection(null).done(function(){ assert(false); }).always(function(){
					next();
				});
			},
			function(next){
				UCI.test.$sync().done(function(){ assert(false); }).always(function(){
					next();
				});
			},
			function(next){
				UCI.test.defsec.$sync().done(function(){ assert(false); }).always(function(){
					next();
				});
			},
			function(next){
				UCI.test.$save_order("test").done(function(){ assert(false); }).always(function(){
					next();
				});
			}
		], function(){
			// make rpc available
			done();
		});
	});
	it("make all rpc calls fail", function(done){
		function do_fail(){
			var def = $.Deferred();
			setTimeout(function(){ def.reject(); }, 0);
			return def.promise();
		}
		global.UBUS = {
			uci: {
				add: do_fail,
				delete: do_fail,
				set: do_fail,
				get: do_fail,
				order: do_fail,
				configs: do_fail
			}
		};
		done();
	});
	it("check that create fails gracefully", function(done){
		UCI.$init().done(function(){
			assert(false);
			done();
		}).fail(function(){
			done();
		});
	});
	it("check that create fails gracefully", function(done){
		UCI.test.$create({
			".type": "test",
			".name": "test"
		}).done(function(){
			assert(false);
			done();
		}).fail(function(){
			done();
		});
	});
	it("check that sync fails gracefully", function(done){
		UCI.$sync().done(function(){
			// sync always succeeds
			done();
		}).fail(function(){
			assert(false);
			done();
		});
	});
	it("check that section sync fails gracefully", function(done){
		UCI.test.test.$sync().done(function(){
			assert(false);
			done();
		}).fail(function(){
			done();
		});
	});
	it("check that save fails gracefully", function(done){
		UCI.test.test.string.value = "foobar";
		UCI.$save().done(function(){
			done();
		}).fail(function(){
			done();
		});
	});
	it("check that add fails gracefully", function(done){
		UCI.test.$create({
			".type": "test",
			".name": "failadd"
		}).done(function(){
			UCI.$save().done(function(){
				done();
			}).fail(function(){
				assert(false);
				done();
			});
		}).fail(function(){
			assert(false);
			done();
		});
	});
	it("check that delete fails gracefully", function(done){
		// just make sure fail code runs
		UCI.test.failadd.$update({});
		UCI.test.failadd.$update({".type": "somethingthatfails"});
		UCI.test[".name"] = "foo";
		UCI.test.failadd.$update({".type": "somethingthatfails"});
		UCI.test[".name"] = "test";
		UCI.test.failadd.$delete();
		UCI.$save().done(function(){
			done();
		}).fail(function(){
			assert(false);
			done();
		});
	});

	it("enable rpc", function(){
		global.UBUS = _RPC;
	});
});

describe("init", function(){
	// make the rpc object available
	it("must initialize first", function(done){
		console.log("--- init ---");
		UCI.$init().done(function(){
			done();
		});
	});
	it("check defaults", function(done){
		var s = UCI.test.defsec;
		assert.notEqual(s.string.value, CONFIG.test.defsec.string);
		assert.notEqual(s.field.value, CONFIG.test.defsec.field);
		assert.equal(s.string.value, s.string.dvalue);
		assert.equal(s.field.value, s.field.dvalue);
		// etc
		done();
	});

});

var get_count = _RPC.uci.get_count;
describe("Basic test", function(){
	it("tests the basic function of loading a config", function(done){
		get_count = _RPC.uci.get_count;
		UCI.$sync().done(function(){
			assert.equal(get_count + 1, _RPC.uci.get_count);
			get_count = _RPC.uci.get_count;
			assert(UCI.test);	
			assert(UCI.test.default);	
			var s = UCI.test.default;
			assert.equal(s.field.value, "value");	
			assert.equal(s.ip4field.value, "test");	
			assert.equal(s.time.value, "00:00");	
			// array should be converted into an array
			assert(s.array.value instanceof Array);	
			assert.equal(s.array.value[0], "juststring");	
			assert.equal(s.uniquearray.value[1], 1);	
			done();
		}).fail(function(){
			done(new Error("unable to sync config"));
		});
	});
	it("tests the basic function of loading a config", function(done){
		UCI.$sync().done(function(){
			// make sure that no more calls to uci.get were made
			assert.equal(get_count, _RPC.uci.get_count);
			done();
		}).fail(function(){
			assert(false);
			done();
		});
	});
	it("check defaults", function(done){
		// after sync we should not have config values
		var s = UCI.test.defsec;
		assert.equal(s.string.value, CONFIG.test.defsec.string);
		assert.equal(s.field.value, CONFIG.test.defsec.field);
		assert.notEqual(s.string.value, s.string.dvalue);
		assert.notEqual(s.field.value, s.field.dvalue);
		done();
	});
});

describe("Section operations", function(){
	it("add a new section with no type should fail", function(done){
		UCI.test.$create({}).done(function(){
			assert(false);
			done();
		}).fail(function(){
			done();
		});
	});
	it("add a new section", function(done){
		UCI.test.$create({
			".name": "mysection",
			".type": "test",
			"field": "value",
			"string": "mystring"
		}).done(function(){
			// section must not be created in the config yet!
			console.log("CHANGES: "+JSON.stringify(UCI.$getChanges()));
			assert(!CONFIG.test.mysection);
			UCI.$save().done(function(){
				assert(CONFIG.test.mysection);
				var s = UCI.test.mysection;
				assert.equal(s.field.value, "value");
			}).always(function(){
				done();
			});
		}).fail(function(){
			done(new Error("unable to create section"));
		});
	});
	it("adding a section with duplicate name should fail", function(done){
		var s = UCI.test.mysection;
		UCI.test.$create({
			".name": "mysection",
			".type": "test",
		}).done(function(){
			assert(false);
			done();
		}).fail(function(){
			assert(s == UCI.test.mysection);
			done();
		});
	});
	it("add an anonymous section", function(done){
		UCI.test.$create({
			".type": "anontype",
			"field": "anonval",
			"string": "anonstring"
		}).done(function(section){
			assert(section);
			// section must not be created in the config yet!
			console.log("CHANGES: "+JSON.stringify(UCI.$getChanges()));
			assert(!CONFIG.test[section[".name"]]);
			UCI.$save().done(function(){
				assert(CONFIG.test[section[".name"]]);
				var s = UCI.test[section[".name"]];
				assert(s);
				assert.equal(s.field.value, "anonval");
				assert.equal(s.string.value, "anonstring");
			}).always(function(){
				done();
			});
		}).fail(function(){
			done(new Error("unable to create section"));
		});
	});

	it("add a new section with invalid type", function(done){
		assert(UCI.test.mysection);
		try {
			UCI.test.$create({
				".name": "mysection",
				".type": "noexist"
			}).done(function(){
				throw new Error("Able to create invalid sections");
				done();
			}).fail(function(){
				done();
			});
		} catch(err){
			console.error("ERROR: "+err);
			assert(false);
			done();
		}
	});

	it("simulate adding a section on the backend", function(done){
		assert(!UCI.test.newsection);
		CONFIG.test.newsection = {
			".type": "test",
			".name": "newsection",
			"string": "mystring"
		};
		CONFIG.test.newsection2 = {
			".type": "test",
			".name": "newsection2",
			"string": "another"
		};

		// we pass second argument that signal that we want to reload
		UCI.$sync(["test", "somegarbage"], true).done(function(){
			var s = UCI.test.newsection;
			var s2 = UCI.test.newsection2;
			assert(s);	
			assert.equal(s.string.value, "mystring");	
			assert.equal(s2.string.value, "another");	
		}).always(function(){
			done();
		});
	});
	it("simulate field modification on backend and a single section reload", function(done){
		var s = UCI.test.newsection;
		assert.equal(s.string.value, "mystring");
		assert.notEqual(s.number.value, 777);
		CONFIG.test.newsection.number = "777";
		UCI.test.newsection.$sync().done(function(){
			assert.equal(s.number.value, 777);
		}).always(function(){
			done();
		});
	});

	it("simulate deleting a section on the backend", function(done){
		delete CONFIG.test.newsection2;
		UCI.test.$mark_for_reload();
		UCI.$sync("test").done(function(){
			var s = UCI.test.newsection;
			var s2 = UCI.test.newsection2;
			assert(s);	
			assert(!s2);	
			assert.equal(s.string.value, "mystring");	
		}).always(function(){
			done();
		});
	});

	// TODO: maybe mark_for_reload should actually be made deprecated now that we have argument passed to $sync..
	it("simulate usage of mark_for_reload", function(done){
		CONFIG.test.newsection = {
			".type": "test",
			".name": "newsection",
			"string": "mystring2"
		};
		CONFIG.test.newsection2 = {
			".type": "test",
			".name": "newsection2",
			"string": "another2"
		};

		// we pass second argument that signal that we want to reload
		UCI.$mark_for_reload();
		UCI.$sync(["test", "somegarbage"]).done(function(){
			var s = UCI.test.newsection;
			var s2 = UCI.test.newsection2;
			assert(s);	
			assert.equal(s.string.value, "mystring2");	
			assert.equal(s2.string.value, "another2");	
		}).always(function(){
			done();
		});
	});

	it("simulate deleting a section", function(done){
		UCI.test.newsection.$delete().done(function(){
			// deleting a section should not delete it from the backend	yet
			assert(CONFIG.test.newsection);
			UCI.$save().done(function(){
				assert(!CONFIG.test.newsection);
			}).always(function(){
				done();
			});
		}).fail(function(){
			assert(false);
			done();
		});
	});

	it("saves a section", function(done){
		// first check here that we indeed have mysection in all the correct places
		assert(UCI.test.mysection);
		UCI.$save().done(function(){
			done();
		});
	});

	it("modifies a field and then saves a section", function(done){
		UCI.test.mysection.field.value = "newstuff";
		assert.equal(UCI.$hasChanges(), true);
		var changes = UCI.$getChanges();
		console.log(JSON.stringify(changes));
		var change = changes.find(function(x){
			return x.config == "test" && x.section == "mysection" && x.option == "field";
		});
		assert(change);
		assert.equal(change.uvalue, "newstuff");
		// first try with an invalid value
		UCI.test.mysection.ip4field.value = "asdf";
		UCI.$save().done(function(){
			assert(false);
			done();
		}).fail(function(){
			UCI.test.mysection.ip4field.value = "";
			UCI.$save().done(function(){
				done();
			}).fail(function(){
				assert(false);
				done();
			});
		});
	});

	/** 
	 * This test tests that reloading works correctly. Values changed by the
	 * user should be preserved while values changed on the backend that are
	 * not changed by the user should be updated. If reload is passed "false"
	 * as argument then all values shall be updated.
	 */
	it("reload a section", function(done){
		var s = UCI.test.mysection;
		s.field.value = "reload";
		s.array.value = ["bar", "bar"];
		// first try modifying it and reloading only user changes
		assert(CONFIG.test.mysection.field != "foobar");
		assert(CONFIG.test.mysection.string != "changed");
		CONFIG.test.mysection.field = "foobar";
		CONFIG.test.mysection.string = "changed";
		// someone has set config to foo bar
		CONFIG.test.mysection.array = ["foo", "bar"];
		// create a new section that we will then delete
		UCI.test.$create({
			".type": "test",
			".name": "willdelete"
		}).done(function(section){
			assert(UCI.test.willdelete);
			// do a reload of this partucular config and instruct reload to keep changes
			UCI.test.$sync({reload: true, keep_user_changes: true}).done(function(){
				// section should still exist
				assert(UCI.test.willdelete);
				// result should be that field will not be reloaded but string will change
				assert(UCI.test.mysection);
				assert(s.field.value == "reload");
				assert(s.string.value == "changed");
				// double check that our user value are kept
				assert.equal(s.array.value[0], "bar");
				assert.equal(s.array.value[1], "bar");
				assert.equal(UCI.$hasChanges(), true);
				// reload needs to be tested with a mock version of data and we need to establish reload rules
				UCI.test.$sync({reload: true, keep_user_changes: false}).done(function(){
					// section should be gone
					assert(!UCI.test.willdelete);
					assert(UCI.test.mysection);
					assert(s.field.value != "reload");
					assert.equal(s.array.value[0], "foo");
					assert.equal(s.array.value[1], "bar");
					// should not have any changes since we have reloaded all fields
					assert.equal(UCI.$hasChanges(), false);
					done();
				}).fail(function(){
					assert.equals(false, "failed to reload section");
					done();
				});
			}).fail(function(){
				done();
			});
		});
	});


	it("reset config", function(done){
		assert(UCI.test.mysection);
		var f = UCI.test.mysection.field;
		f.value = "newstuff2";
		assert.equal(UCI.$hasChanges(), true);
		assert.notEqual(f.value, f.ovalue);
		assert(f.value == "newstuff2");
		UCI.test.$create({
			".type": "test",
			".name": "todelete"
		}).done(function(){
			assert(UCI.test.todelete);
			UCI.$reset();
			assert(!UCI.test.todelete);
			assert(f.valid);
			assert.equal(f.value, f.ovalue);

			// try exceptions
			f.value = "foo";
			UCI.test.mysection.$reset_defaults(["field"]);
			assert.equal(f.value, "foo");

			UCI.test.mysection.$reset_defaults();
			assert.notEqual(f.value, f.ovalue);
			assert.equal(f.value, f.dvalue);
			f.value = "newstuff2";
			assert.notEqual(f.value, f.dvalue);

			UCI.test.mysection.$reset_defaults();
			assert.equal(f.value, f.dvalue);

			UCI.test.$reset();
			done();
		});
	});

	/**
	 * This test checks for possibility to delete individual changes fron the
	 * list of changes such that these can be reverted. Special handling needs
	 * to be done when reverting an added or deleted section. This is handled
	 * by the uci module. 
	 */
	it("reverting individual changes", function(done){
		// we will do the test in this order
		// 1) add a new section and modify some fields in it and then delete
		// the change. It should be one change (instead of being multiple set
		// commands) because the section is newly added. 
		// 2) save the config and now modify a field in the newly added section
		// and then try deleting each change to revert the field to ovalue
		// (current value stored in uci)
		// 3) now with changes still pending we try to delete the section and
		// make sure that our changes to individual fields are no longer in the
		// list of changes and are replaced with only one change that deletes
		// the section. We should now be able to revert this change and should
		// once again see all modifications to the fields in the list of
		// changes. 
		assert.equal(UCI.$getChanges().length, 0);
		UCI.test.$create({
			".type": "test",
			".name": "changes"
		}).done(function(section){
			var s = UCI.test.changes;
			assert(!CONFIG.test.changes);
			assert.equal(UCI.$getChanges().length, 1);
			// try to modify some fields
			s.string.value = "changes";
			assert.equal(UCI.$getChanges().length, 1);
			// try undoing the change and add it again
			UCI.$getChanges().find(function(x){
				return x.type == "add";
			}).$delete();
			assert(!UCI.test.changes);
			assert.equal(UCI.$getChanges().length, 0);
			UCI.test.$create({
				".type": "test",
				".name": "changes"
			}).done(function(section){
				assert(UCI.test.changes != s);
				s = UCI.test.changes;
				s.string.value = "changes";
				// try deleting the section
				s.$delete();
				assert(!UCI.test.changes);
				// deleting a new section is not recoverable
				assert.equal(UCI.$getChanges().length, 0);
				// revert the change
				UCI.test.$create({
					".type": "test",
					".name": "changes"
				}).done(function(section){
					assert(UCI.test.changes);
					s = UCI.test.changes;
					// save the config
					UCI.$save().done(function(){
						assert(CONFIG.test.changes);
						assert.equal(s.string.value, "test");
						assert.equal(s.string.value, s.string.ovalue);
						s.string.value = "nochange";
						s.field.value = "strings";
						assert.equal(s.string.value, "nochange");
						assert.equal(UCI.$getChanges().length, 2);
						// delete the string change
						UCI.$getChanges().find(function(x){
							return x.option == "string";
						}).$delete();
						assert.equal(s.string.value, "test");
						assert.equal(UCI.$getChanges().length, 1);
						s.string.value = "beforedelete";
						assert.equal(UCI.$getChanges().length, 2);
						// try deleting the whole section
						s.$delete();
						assert.equal(UCI.$getChanges().length, 1);
						// and reverting the change
						UCI.$getChanges().find(function(x){
							return x.type == "delete" && x.section == "changes";
						}).$delete();
						console.log(JSON.stringify(UCI.$getChanges()));
						assert.equal(UCI.$getChanges().length, 2);
						done();
					}).fail(function(){
						assert(false);
						done();
					});
				}).fail(function(){
					assert(false);
					done();
				});
			}).fail(function(){
				assert(false);
				done();
			});
		}).fail(function(){
			assert(false);
			done();
		});
	});
});

describe("Field operations", function(){
	it("try setting different values", function(done){
		assert(UCI.test.mysection);
		UCI.test.$create({
			".name": "another",
			".type": "test",
			"field": "value"
		}).done(function(section){
			var s = UCI.test.another;
			assert(s == section);
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
	it("check changes calculator", function(done){
		var s = UCI.test.mysection;
		UCI.$save().done(function(){
			function check(){
				assert.equal(UCI.$hasChanges(), true);
				s.$reset();
				assert.equal(UCI.$hasChanges(), false);
			}
			assert.equal(UCI.$hasChanges(), false);
			s.string.value = "abracadabra"; check();
			s.number.value = "123"; check();
			s.array.value = [123]; check();
			s.array.value = []; check();
			assert.equal(UCI.$hasChanges(), false);
			s.array.value = [123];
			s.array.ovalue = [123];
			assert.equal(UCI.$hasChanges(), false);
			s.array.ovalue = [123, 123];
			assert.equal(UCI.$hasChanges(), true);
			s.array.value = [123, 123];
			assert.equal(UCI.$hasChanges(), false);
			done();
		}).fail(function(){
			assert(false);
			done();
		});
	});

	it("check field value conversions", function(){
		var s = UCI.test.mysection;
		// check string conversion
		s.string.value = "anystring";
		assert.equal(s.string.value, "anystring");
		s.string.value = false;
		assert.equal(s.string.value, "false");
		s.string.value = 0;
		assert.equal(s.string.value, "0");
		s.string.value = 123.4;
		assert.equal(s.string.value, "123.4");
		s.string.value = [];
		assert.equal(s.string.value, "");
		s.string.value = ["foo",0,true];
		assert.equal(s.string.value, "foo,0,true");

		// check number conversion
		s.number.value = 1234;
		assert.equal(s.number.value, 1234);
		// these are just invalid
		s.number.value = [1, 3, 4, 2];
		s.number.value = "string"
		assert.equal(s.number.value, 1234);
		// make sure that empty value is interpreted as setting a zero because this will correctly work with text fields when user deletes text
		s.number.value = "";
		assert.equal(s.number.value, 0);
		s.number.value = [];
		assert.equal(s.number.value, 0);
		s.number.value = false;
		assert.equal(s.number.value, 0);
		s.number.value = true;
		assert.equal(s.number.value, 1);
		s.number.value = "12";
		assert.equal(s.number.value, 12);
		s.number.value = "-12";
		assert.equal(s.number.value, -12);
		s.number.value = "-12.4";
		assert.equal(s.number.value, -12.4);
		
		// test array
		s.array.value = [1, 2, 3, 4];
		assert.equal(s.array.value[3], 4);
		// following are invalid
		s.array.value = "test";
		s.array.value = 123;
		s.array.value = false;
		s.array.value = true;
		assert.equal(s.array.value[3], 4);
	});

	it("string field", function(){
		var s = UCI.test.mysection;
		assert.equal(UCI.$getErrors().length, 0);
		s.string.value = "24:00";
		assert.equal(UCI.$getErrors().length, 0);
	});
	it("time field", function(done){
		var s = UCI.test.mysection;
		assert.equal(UCI.$getErrors().length, 0);
		s.time.value = "24:00";
		assert.equal(s.time.valid, false);
		assert.equal(UCI.$getErrors().length, 1);
		s.time.value = "asdf";
		assert.equal(UCI.$getErrors().length, 1);
		s.time.value = "10:30:40";
		assert.equal(UCI.$getErrors().length, 1);
		s.time.value = "10:30";
		assert.equal(UCI.$getErrors().length, 0);
		done();
	});

	it("timespan field", function(){
		var s = UCI.test.mysection;
		assert.equal(UCI.$getErrors().length, 0);
		s.timespan.value = "12:30-11:20";
		assert.equal(UCI.$getErrors().length, 1);
		s.timespan.value = "12:30-30:20";
		assert.equal(UCI.$getErrors().length, 1);
		s.timespan.value = "12-14";
		assert.equal(UCI.$getErrors().length, 1);
		s.timespan.value = "12-14-30";
		assert.equal(UCI.$getErrors().length, 1);
		s.timespan.value = "9:30-10:30";
		assert.equal(UCI.$getErrors().length, 0);
		s.timespan.value = "09:30-10:30";
		assert.equal(UCI.$getErrors().length, 0);
		s.timespan.value = "00:00-10:30";
		assert.equal(UCI.$getErrors().length, 0);
	});

	it("ipv4validator", function(done){
		var s = UCI.test.mysection;
		assert.equal(UCI.$getErrors().length, 0);
		s.ip4field.value = "123.300.200.100";
		assert.equal(UCI.$getErrors().length, 1);
		s.ip4field.value = "123.300.200";
		assert.equal(UCI.$getErrors().length, 1);
		s.ip4field.value = "0.0.0.0";
		assert.equal(UCI.$getErrors().length, 1);
		s.ip4field.value = ".1.2.3.4";
		assert.equal(UCI.$getErrors().length, 1);
		s.ip4field.value = "ab.12.4.c";
		assert.equal(UCI.$getErrors().length, 1);
		s.ip4field.value = "";
		assert.equal(UCI.$getErrors().length, 0);
		s.ip4field.value = "127.0.0.1";
		assert.equal(UCI.$getErrors().length, 0);
		done();
	});

	it("weekdays", function(){
		var s = UCI.test.mysection;
		assert.equal(UCI.$getErrors().length, 0);
		// assignments to array fields of nonarray values should fail
		console.log("Array value: "+s.weekdays.value);
		assert(s.weekdays.value != undefined);
		assert(s.weekdays.value instanceof Array);
		s.weekdays.value = "string";
		assert.equal(UCI.$getErrors().length, 0);
		assert(s.weekdays.value instanceof Array);
		assert(s.weekdays.value[0] == s.weekdays.dvalue[0]);
		assert(UCI.$getErrors().length == 0);
		s.weekdays.value = ["string"];
		assert.equal(s.weekdays.value[0], "string");
		assert.equal(UCI.$getErrors().length, 1);
		s.weekdays.value = [0];
		assert.equal(UCI.$getErrors().length, 1);
		s.weekdays.value = [{}];
		assert.equal(UCI.$getErrors().length, 1);
		s.weekdays.value = ["Mon", "Wed"];
		assert.equal(UCI.$getErrors().length, 0);
		s.weekdays.value = ["MON", "wed"];
		assert.equal(UCI.$getErrors().length, 0);
		s.weekdays.value = ["MON", "wed", ""];
		assert.equal(UCI.$getErrors().length, 1);
		s.weekdays.value = "";
		assert.equal(UCI.$getErrors().length, 0);
		s.weekdays.value = ["Mon"];
		assert.equal(UCI.$getErrors().length, 0);
	});

	it("portrange", function(){
		var s = UCI.test.mysection;
		assert.equal(UCI.$getErrors().length, 0);
		s.portrange.value = "100000-300000";
		assert.equal(UCI.$getErrors().length, 1);
		s.portrange.value = "100000";
		assert.equal(UCI.$getErrors().length, 1);
		s.portrange.value = "60000";
		assert.equal(UCI.$getErrors().length, 0);
		s.portrange.value = "1-30";
		assert.equal(UCI.$getErrors().length, 0);
		s.portrange.value = "0-30";
		assert.equal(UCI.$getErrors().length, 1);
		s.portrange.value = "30-3";
		assert.equal(UCI.$getErrors().length, 1);
		s.portrange.value = "30-3-4";
		assert.equal(UCI.$getErrors().length, 1);
		s.portrange.value = "255";
		assert.equal(UCI.$getErrors().length, 0);
		s.portrange.value = "";
		assert.equal(UCI.$getErrors().length, 0);
	});

	it("number limit", function(){
		var s = UCI.test.mysection;
		s.minmax.value = -1;
		assert.equal(UCI.$getErrors().length, 1);
		s.minmax.value = 101;
		assert.equal(UCI.$getErrors().length, 1);
		s.minmax.value = 1;
		assert.equal(UCI.$getErrors().length, 0);
		s.minmax.value = 0;
		assert.equal(UCI.$getErrors().length, 0);
		s.minmax.value = 100;
		assert.equal(UCI.$getErrors().length, 0);
	});

	it("multicast ip", function(){
		var s = UCI.test.mysection;
		assert.equal(UCI.$getErrors().length, 0);
		s.multicast.value = "224.0.1.0";
		assert.equal(UCI.$getErrors().length, 0);
		s.multicast.value = "0";
		assert.equal(UCI.$getErrors().length, 1);
		s.multicast.value = null;
		assert.equal(s.multicast.value, "0");
		s.multicast.value = "";
		assert.equal(UCI.$getErrors().length, 0);
		s.multicast.value = "127.0.0.1.";
		assert.equal(UCI.$getErrors().length, 1);
		s.multicast.value = "127.0.0.1";
		assert.equal(UCI.$getErrors().length, 1);
		s.multicast.value = "224.0.0.0";
		assert.equal(UCI.$getErrors().length, 0);
	});

	it("unicast ip", function(){
		var s = UCI.test.mysection;
		assert.equal(UCI.$getErrors().length, 0);
		s.unicast.value = "0.0.0.0"; // this one is valid ip but not a valid unicast ip
		assert.equal(UCI.$getErrors().length, 1);
		s.unicast.value = "230.1.240.1";
		assert.equal(UCI.$getErrors().length, 1);
		s.unicast.value = "81.82.83.84";
		assert.equal(UCI.$getErrors().length, 0);
		s.unicast.value = "24.10.10.10.10";
		assert.equal(UCI.$getErrors().length, 1);
		s.unicast.value = "";
		assert.equal(UCI.$getErrors().length, 0);
	});

	it("cidr ipv4", function(){
		var s = UCI.test.mysection;
		assert.equal(UCI.$getErrors().length, 0);
		s.ip4cidr.value = "192.168.1.0/24";
		assert.equal(UCI.$getErrors().length, 1);
		s.ip4cidr.value = "192.168.1.0/33";
		assert.equal(UCI.$getErrors().length, 1);
		s.ip4cidr.value = "192.168.1.0/not mask";
		assert.equal(UCI.$getErrors().length, 1);
		s.ip4cidr.value = "192.168.1.0.1/20";
		assert.equal(UCI.$getErrors().length, 1);
		s.ip4cidr.value = "192.168.0.1/8";
		assert.equal(UCI.$getErrors().length, 0);
		s.ip4cidr.value = "192.168.2.1";
		assert.equal(UCI.$getErrors().length, 0);
		s.ip4cidr.value = "";
		assert.equal(UCI.$getErrors().length, 0);
	});

	it("ip address (v4 + v6)", function(){
		var s = UCI.test.mysection;
		assert.equal(UCI.$getErrors().length, 0);
		s.ip.value = "192.168.1.0";
		assert.equal(UCI.$getErrors().length, 0);
		s.ip.value = "not valid value";
		assert.equal(UCI.$getErrors().length, 1);
		s.ip.value = "fe80::6ae3:b5ff:fe92:330e";
		assert.equal(UCI.$getErrors().length, 0);
		s.ip.value = "2001:0db8:0a0b:12f0:0000:0000:0000:0001";
		assert.equal(UCI.$getErrors().length, 0);
		s.ip.value = "not an ip";
		assert.equal(UCI.$getErrors().length, 1);
		// TODO: this one for now appears valid when it is not. Need to update the regex.
		//s.ip.value = "2001:0db8:0a0b:12f0:0000:0000:0000:0001:123:123";
		//assert.equal(UCI.$getErrors().length, 1);
		s.ip.value = "2001:0db8::0001";
		assert.equal(UCI.$getErrors().length, 0);
		s.ip.value = "2001:db8:0:0:0:0:2:1";
		assert.equal(UCI.$getErrors().length, 0);
		s.ip.value = "2001:db8::2:1";
		assert.equal(UCI.$getErrors().length, 0);
		s.ip.value = "2001:db8::1:1:1:1:1";
		assert.equal(UCI.$getErrors().length, 0);
		s.ip.value = "3731:54:65fe:2::a7";
		assert.equal(UCI.$getErrors().length, 0);
	});
	it("ip cidr address (v4 + v6)", function(){
		var s = UCI.test.mysection;
		assert.equal(UCI.$getErrors().length, 0);
		s.ipcidr.value = "3731:54:65fe:2::a7";
		assert.equal(UCI.$getErrors().length, 0);
		s.ipcidr.value = "192.168.2.1";
		assert.equal(UCI.$getErrors().length, 0);
		s.ipcidr.value = "3731:54:65fe:2::a7/200";
		assert.equal(UCI.$getErrors().length, 1);
		s.ipcidr.value = "fe80::/10"; // defaults for firewall rules
		assert.equal(UCI.$getErrors().length, 0);
		s.ipcidr.value = "";
		assert.equal(UCI.$getErrors().length, 0);
		s.ipcidr.value = "3731:54:65fe:2::a7/56";
		assert.equal(UCI.$getErrors().length, 0);
		// TODO: revise this and come up with list of possible test cases and then update the validator
		/*
		s.ipcidr.value = "noip/100";
		assert.equal(UCI.$getErrors().length, 0);
		s.ipcidr.value = "2001:5::/32";
		assert.equal(UCI.$getErrors().length, 0);
		s.ipcidr.value = "::1/128";
		assert.equal(UCI.$getErrors().length, 0);
		s.ipcidr.value = "::ffff:10.0.0.3/96";
		assert.equal(UCI.$getErrors().length, 0);
		s.ipcidr.value = "192.168.0.0/24";
		assert.equal(UCI.$getErrors().length, 0);
		s.ipcidr.value = "2001:1::1/128";
		assert.equal(UCI.$getErrors().length, 0);
		*/
	});
	it("ip4 netmask", function(){
		var s = UCI.test.mysection;
		assert.equal(UCI.$getErrors().length, 0);
		s.ip4mask.value = "192.168.1.1";
		assert.equal(UCI.$getErrors().length, 1);
		s.ip4mask.value = "192.168.1.1.13";
		assert.equal(UCI.$getErrors().length, 1);
		s.ip4mask.value = "test";
		assert.equal(UCI.$getErrors().length, 1);
		s.ip4mask.value = "-1.500.30.1";
		assert.equal(UCI.$getErrors().length, 1);
		s.ip4mask.value = "255.255.255.0";
		assert.equal(UCI.$getErrors().length, 0);
		s.ip4mask.value = "255.245.255.0";
		assert.equal(UCI.$getErrors().length, 1);
		s.ip4mask.value = "255.0.0.0";
		assert.equal(UCI.$getErrors().length, 0);
		s.ip4mask.value = "";
		assert.equal(UCI.$getErrors().length, 0);
	});
	it("mac address", function(){
		var s = UCI.test.mysection;
		assert.equal(UCI.$getErrors().length, 0);
		s.mac.value = "192.168.1.1";
		assert.equal(UCI.$getErrors().length, 1);
		s.mac.value = "ab:fg:1:3:4:";
		assert.equal(UCI.$getErrors().length, 1);
		s.mac.value = "ab:fg:12:34:55:02";
		assert.equal(UCI.$getErrors().length, 1);
		s.mac.value = "ab:fa:12:34:55:02";
		assert.equal(UCI.$getErrors().length, 0);
		s.mac.value = "AB:CD:12:34:45:22";
		assert.equal(UCI.$getErrors().length, 0);
	});
	it("mac list", function(){
		var s = UCI.test.mysection;
		assert.equal(UCI.$getErrors().length, 0);
		s.maclist.value = "asdf"; // value will not be set because array is expected
		assert.equal(UCI.$getErrors().length, 0);
		s.maclist.value = ["AB:CD:12:34:45:22"];
		assert.equal(UCI.$getErrors().length, 0);
		s.maclist.value = ["AB:CD:12:34:45:22", "asdf"];
		assert.equal(UCI.$getErrors().length, 1);
		s.maclist.value = ["AB:CD:12:34:45:22", "aa:bb:cc:dd:ee:ff"];
		assert.equal(UCI.$getErrors().length, 0);
	});
	it("ip array", function(){
		var s = UCI.test.mysection;
		assert.equal(UCI.$getErrors().length, 0);
		s.iparray.value = "asdf"; // value will not be set because array is expected
		assert.equal(UCI.$getErrors().length, 0);
		assert(s.iparray.value.length == 0);
		s.iparray.value = ["asdf"];
		assert.equal(UCI.$getErrors().length, 1);
		s.iparray.value = ["20.10.30.4", "10.20.30.40"];
		assert(s.iparray.value.length == 2);
		assert.equal(UCI.$getErrors().length, 0);
	});

	it("uniqueiparray", function(){
		var s = UCI.test.mysection;
		assert.equal(UCI.$getErrors().length, 0);
		s.uniqueiparray.value = ["192.168.2.1", "192.168.2.1"];
		assert.equal(UCI.$getErrors().length, 1);
		s.uniqueiparray.value = ["192.168.2.1.12", "192.168.2.1"];
		assert.equal(UCI.$getErrors().length, 1);
		s.uniqueiparray.value = ["192.168.2.1"];
		assert.equal(UCI.$getErrors().length, 0);
	});

	it("uniquearray", function(){
		var s = UCI.test.mysection;
		assert.equal(UCI.$getErrors().length, 0);
		s.uniquearray.value = ["foo", "foo"];
		assert.equal(UCI.$getErrors().length, 1);
		s.uniquearray.value = ["foo", "0", 0];
		assert.equal(UCI.$getErrors().length, 1);
		s.uniquearray.value = ["foo", "0"];
		assert.equal(UCI.$getErrors().length, 0);
		s.uniquenumarr.value = ["two", "items", 123, 456];
		assert.equal(UCI.$getErrors().length, 1);
		s.uniquenumarr.value = ["two", "items", null];
		assert.equal(UCI.$getErrors().length, 1);
		s.uniquenumarr.value = [null, null, null];
		assert.equal(UCI.$getErrors().length, 1);
		s.uniquenumarr.value = [11, 11];
		assert.equal(UCI.$getErrors().length, 1);
		s.uniquenumarr.value = [11, 10];
		assert.equal(UCI.$getErrors().length, 0);
		s.uniqueboolarr.value = [false, false];
		assert.equal(UCI.$getErrors().length, 1);
		s.uniqueboolarr.value = [false, true];
		assert.equal(UCI.$getErrors().length, 0);
		s.uniquearray.value = ["two", "items"];
		assert.equal(UCI.$getErrors().length, 0);
	});

	it("boolean ops", function(done){
		var s = UCI.test.mysection;
		assert.equal(UCI.$getErrors().length, 0);
		var prev = s.bool.value;
		s.bool.value = "asdf";
		assert(s.bool.value == prev);
		//assert.equal(UCI.$getErrors().length, 1);
		s.bool.value = true;
		s.boolonoff.value = true;
		s.boolyesno.value = true;
		s.booltf.value = true;
		s.boolnodval.value = true;
		UCI.$save().done(function(){
			var conf = CONFIG.test[s[".name"]];
			assert.equal(conf.bool, true);
			assert.equal(conf.boolonoff, "on");
			assert.equal(conf.boolyesno, "yes");
			assert.equal(conf.booltf, "true");
			assert.equal(conf.boolnodval, true);

			s.bool.value = false;
			s.boolonoff.value = false;
			s.boolyesno.value = false;
			s.booltf.value = false;
			UCI.$save().done(function(){
				assert.equal(conf.bool, false);
				assert.equal(conf.boolonoff, "off");
				assert.equal(conf.boolyesno, "no");
				assert.equal(conf.booltf, "false");

				assert.equal(s.bool.value, false);
				assert.equal(s.boolonoff.value, false);
				assert.equal(s.boolyesno.value, false);
				assert.equal(s.booltf.value, false);
			}).always(function(){
				done();
			});
		}).fail(function(){
			assert(false);
			done();
		});
	});
});

UCI.test.$registerSectionType("validated", {
	"string": { dvalue: "test", type: String },
	"strlen": { dvalue: 4, type: Number } // will hold the length of string
}, function(s){
	if(s.string.value.length != s.strlen.value){
		return [
			gettext("strlen value does not crrespond to string length!"),
			gettext("second error")
		];
	}
	return null;
});

describe("Several ways to validate sections: ", function(){
	var s = null;
	it("create a section with the type that we defined to have custom validator", function(done){
		UCI.test.$create({
			".type": "validated",
			".name": "val"
		}).done(function(result){
			s = UCI.test.val;
			done();
		});
	});
	it("custom section validator", function(){
		s.string.value = "mystring";
		assert.equal(UCI.$getErrors().length, 2);
		s.strlen.value = 8;
		assert.equal(UCI.$getErrors().length, 0);
	});
});

describe("UCI section ordering: ", function(){
	it("save order", function(done){
		UCI.test.$save_order("test").done(function(){
			done();
		}).fail(function(){
			assert(false);
			done();
		});
	});
	it("save order invalid type", function(done){
		UCI.test.$save_order("fooinvalid").done(function(){
			assert(false);
			done();
		}).fail(function(){
			done();
		});
	});
});

/**
 * The purpose of this test is to document existing error handling and just to
 * make sure we cover all error handling paths that are currently coded into
 * the uci module. Some of the error handling code may never even run in
 * production, but it's still good to keep it around. These tests make sure we
 * cover all of that code and get 100% test coverage (which is good because if
 * error handling code contains a coding error that makes the handler crash
 * then it is not a good error handling block. 
 */
describe("various error handling", function(){
	it("errors", function(done){
		var s = UCI.test.mysection;

		s.invarr.value = "asdf";
		s.invarritem.value = ["asdf"];
		s.invarritem.value = ["asdf"];
		s.invnotype.value = true;
		
		assert.equal(s.invnotype.value, undefined);
		// since fields are invalid we should only get a console printout but still allow them to be there
		assert.equal(UCI.$getErrors().length, 0);

		done();
	});
});
