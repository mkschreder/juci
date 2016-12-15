/*global.JSON = require("JSON"); 
global.async = require("async"); 
global.$ = global.jQuery = require("jquery-deferred"); 
global.$.ajax = require("najax"); 
global.async = require("async"); 
global.watch = require("watchjs").watch; 
global.expect = require("expect.js"); 
*/

// simulated config database 
var CONFIG = {
	test: {
	}
};

global.gettext = function(str) { return str; }
global.assert = require("assert");
global.async = require("async"); 
global.$ = global.jQuery = require("jquery-deferred"); 
global.UBUS = {
	uci: {
		get: function(params){
			console.log("UCI get");
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
					console.error("RPC: INVALID PARAMETERS TO UCI SET!");
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
					configs: Object.keys(CONFIG)
				});
			}, 0);
			return def.promise();
		}
	}
};

var uci = require("../uci");

UCI.$registerConfig("test");
UCI.test.$registerSectionType("test", {
	"field": { dvalue: "test", type: String },
	"string": { dvalue: "test", type: String },
	"number": { dvalue: 3.14, type: Number },
	"array": { dvalue: [], type: Array },
	"ip4field": { dvalue: "test", type: String, validator: UCI.validators.IP4AddressValidator },
	"time": { dvalue: "00:00", type: String, validator: UCI.validators.TimeValidator },
	"timespan": { dvalue: "00:00-01:00", type: String, validator: UCI.validators.TimespanValidator },
	"weekdays": { dvalue: [], type: Array, validator: UCI.validators.WeekDayListValidator },
	"portrange": { dvalue: "", type: String, validator: UCI.validators.PortValidator },
	"minmax": { dvalue: "", type: Number, validator: UCI.validators.NumberLimitValidator(0, 100) },
	"multicast": { dvalue: "", type: String, validator: UCI.validators.IP4MulticastAddressValidator },
	"unicast": { dvalue: "", type: String, validator: UCI.validators.IP4UnicastAddressValidator },
	"ip4cidr": { dvalue: "", type: String, validator: UCI.validators.IP4CIDRValidator },
	"ip": { dvalue: "", type: String, validator: UCI.validators.IPAddressValidator },
	"ipcidr": { dvalue: "", type: String, validator: UCI.validators.IPCIDRAddressValidator },
	"ip4mask": { dvalue: "", type: String, validator: UCI.validators.IP4NetmaskValidator },
	"mac": { dvalue: "", type: String, validator: UCI.validators.MACAddressValidator },
	"maclist": { dvalue: [], type: Array, validator: UCI.validators.MACListValidator },
	"iparray": { dvalue: [], type: Array, validator: UCI.validators.ArrayValidator(UCI.validators.IP4AddressValidator) },
	"bool": { dvalue: false, type: Boolean },
	"boolyesno": { dvalue: "yes", type: Boolean },
	"boolonoff": { dvalue: "on", type: Boolean },
	"booltf": { dvalue: "true", type: Boolean },
});

describe("init", function(){
	it("must initialize first", function(done){
		UCI.$init().done(function(){
			done();
		});
	});
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
		assert(UCI.test.mysection);
		try {
			UCI.test.$create({
				".name": "mysection",
				".type": "noexist"
			}).done(function(){
				throw new Error("Able to create invalid sections");
				done();
			}).fail(function(){
				throw new Error("unable to create section");
				done();
			});
		} catch(err){
			console.error("ERROR: "+err);
			done();
		}
	});

	it("saves a section", function(done){
		// first check here that we indeed have mysection in all the correct places
		assert(UCI.test.mysection);
		assert.equal(UCI.test["@test"][0][".name"], "mysection");
		assert.equal(UCI.test["@all"][0][".name"], "mysection");
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
		UCI.$save().done(function(){
			done();
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
		// first try modifying it and reloading only user changes
		assert(CONFIG.test.mysection.field != "foobar");
		assert(CONFIG.test.mysection.string != "changed");
		CONFIG.test.mysection.field = "foobar";
		CONFIG.test.mysection.string = "changed";
		UCI.test.$reload(true).done(function(){
			// result should be that field will not be reloaded but string will change
			assert(UCI.test.mysection);
			assert(s.field.value == "reload");
			assert(s.string.value == "changed");
			// reload needs to be tested with a mock version of data and we need to establish reload rules
			UCI.test.$reload(false).done(function(){
				assert(UCI.test.mysection);
				assert(s.field.value != "reload");
				done();
			}).fail(function(){
				assert.equals(false, "failed to reload section");
				done();
			});
		}).fail(function(){
			done();
		});
	});


	it("reset config", function(done){
		var f = UCI.test.mysection.field;
		f.value = "newstuff2";
		assert.equal(UCI.$hasChanges(), true);
		assert(f.value == "newstuff2");
		UCI.test.$reset();
		assert(f.value != "newstuff2");
		assert(UCI.test.mysection);
		done();
	});
});

describe("Field operations", function(){
	it("try setting different values", function(done){
		assert(UCI.test.mysection);
		UCI.test.$create({
			".name": "another",
			".type": "test",
			"field": "value"
		}).done(function(){
			var s = UCI.test.another;
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
	it("check that fields can not be set to values of different type than the field itself", function(){
		var s = UCI.test.mysection;
		s.string.value = "anystring";
		assert.equal(s.string.value, "anystring");
		s.string.value = false;
		s.string.value = 0;
		s.string.value = 123.4;
		s.string.value = [];
		assert.equal(s.string.value, "anystring");
		s.number.value = 1234;
		assert.equal(s.number.value, 1234);
		s.number.value = "";
		s.number.value = false;
		s.number.value = true;
		s.number.value = [];
		assert.equal(s.number.value, 1234);
		s.array.value = [1, 2, 3, 4];
		assert.equal(s.array.value[3], 4);
		s.array.value = "test";
		s.array.value = 123;
		s.array.value = false;
		s.array.value = true;
		assert.equal(s.array.value[3], 4);
	});

	it("string field", function(){
		var s = UCI.test["@test"][0];
		assert.equal(UCI.$getErrors().length, 0);
		s.string.value = "24:00";
		assert.equal(UCI.$getErrors().length, 0);
	});
	it("time field", function(done){
		var s = UCI.test["@test"][0];
		assert.equal(UCI.$getErrors().length, 0);
		s.time.value = "24:00";
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
		var s = UCI.test["@test"][0];
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
		var s = UCI.test["@test"][0];
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
		var s = UCI.test["@test"][0];
		assert.equal(UCI.$getErrors().length, 0);
		// assignments to array fields of nonarray values should fail
		s.weekdays.value = "string";
		assert(s.weekdays.value instanceof Array && s.weekdays.value.length == 0 && UCI.$getErrors().length == 0);
		s.weekdays.value = ["string"];
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
		assert.equal(UCI.$getErrors().length, 1);
		s.weekdays.value = ["Mon"];
		assert.equal(UCI.$getErrors().length, 0);
	});

	it("portrange", function(){
		var s = UCI.test["@test"][0];
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
		var s = UCI.test["@test"][0];
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
		var s = UCI.test["@test"][0];
		assert.equal(UCI.$getErrors().length, 0);
		s.multicast.value = "0";
		assert.equal(UCI.$getErrors().length, 1);
		s.multicast.value = "0";
		assert.equal(UCI.$getErrors().length, 1);
		s.multicast.value = "";
		assert.equal(UCI.$getErrors().length, 0);
		s.multicast.value = null; // TODO: should we really allow null?
		assert.equal(UCI.$getErrors().length, 0);
		s.multicast.value = "127.0.0.1.";
		assert.equal(UCI.$getErrors().length, 1);
		s.multicast.value = "127.0.0.1";
		assert.equal(UCI.$getErrors().length, 1);
		s.multicast.value = "224.0.0.0";
		assert.equal(UCI.$getErrors().length, 0);
	});

	it("unicast ip", function(){
		var s = UCI.test["@test"][0];
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
		var s = UCI.test["@test"][0];
		assert.equal(UCI.$getErrors().length, 0);
		s.ip4cidr.value = "192.168.1.0/24";
		assert.equal(UCI.$getErrors().length, 0);
		s.ip4cidr.value = "192.168.1.0/33";
		assert.equal(UCI.$getErrors().length, 1);
		s.ip4cidr.value = "192.168.1.0/not mask";
		assert.equal(UCI.$getErrors().length, 1);
		s.ip4cidr.value = "192.168.1.0.1/20";
		assert.equal(UCI.$getErrors().length, 1);
		s.ip4cidr.value = "192.168.1.0";
		assert.equal(UCI.$getErrors().length, 1);
		s.ip4cidr.value = "";
		assert.equal(UCI.$getErrors().length, 0);
	});

	it("ip address (v4 + v6)", function(){
		var s = UCI.test["@test"][0];
		assert.equal(UCI.$getErrors().length, 0);
		s.ip.value = "192.168.1.0";
		assert.equal(UCI.$getErrors().length, 0);
		s.ip.value = "not valid value";
		assert.equal(UCI.$getErrors().length, 1);
		s.ip.value = "fe80::6ae3:b5ff:fe92:330e";
		assert.equal(UCI.$getErrors().length, 0);
		s.ip.value = "2001:0db8:0a0b:12f0:0000:0000:0000:0001";
		assert.equal(UCI.$getErrors().length, 0);
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
		var s = UCI.test["@test"][0];
		assert.equal(UCI.$getErrors().length, 0);
		s.ipcidr.value = "3731:54:65fe:2::a7";
		assert.equal(UCI.$getErrors().length, 0);
		/** TODO: make a full list of test cases for ipv6 cidr notation and then rewrite the validator to support all of them! */
		/*
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
		var s = UCI.test["@test"][0];
		assert.equal(UCI.$getErrors().length, 0);
		s.ip4mask.value = "192.168.1.1";
		assert.equal(UCI.$getErrors().length, 1);
		s.ip4mask.value = "192.168.1.1.13";
		assert.equal(UCI.$getErrors().length, 1);
		s.ip4mask.value = "test";
		assert.equal(UCI.$getErrors().length, 1);
		s.ip4mask.value = "255.255.255.0";
		assert.equal(UCI.$getErrors().length, 0);
		s.ip4mask.value = "255.245.255.0";
		assert.equal(UCI.$getErrors().length, 1);
		s.ip4mask.value = "255.0.0.0";
		assert.equal(UCI.$getErrors().length, 0);
	});
	it("mac address", function(){
		var s = UCI.test["@test"][0];
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
		var s = UCI.test["@test"][0];
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
		var s = UCI.test["@test"][0];
		assert.equal(UCI.$getErrors().length, 0);
		s.iparray.value = "asdf"; // value will not be set because array is expected
		assert.equal(UCI.$getErrors().length, 0);
		assert(s.iparray.value.length == 0);
		s.iparray.value = ["20.10.30.4", "10.20.30.40"];
		assert(s.iparray.value.length == 2);
		assert.equal(UCI.$getErrors().length, 0);
	});
	it("boolean ops", function(){
		var s = UCI.test["@test"][0];
		assert.equal(UCI.$getErrors().length, 0);
		var prev = s.bool.value;
		s.bool.value = "asdf";
		assert(s.bool.value == prev);
		//assert.equal(UCI.$getErrors().length, 1);
		s.bool.value = true;
		s.boolonoff.value = true;
		s.boolyesno.value = true;
		s.booltf.value = true;
		UCI.$save().done(function(){
			var conf = CONFIG.test[s[".name"]];
			assert.equal(conf.bool, true);
			assert.equal(conf.boolonoff, "on");
			assert.equal(conf.boolyesno, "yes");
			assert.equal(conf.booltf, "true");

			s.bool.value = false;
			s.boolonoff.value = false;
			s.boolyesno.value = false;
			s.booltf.value = false;
			UCI.$save().done(function(){
				assert.equal(conf.bool, false);
				assert.equal(conf.boolonoff, "off");
				assert.equal(conf.boolyesno, "no");
				assert.equal(conf.booltf, "false");
			});
		});
	});
});

