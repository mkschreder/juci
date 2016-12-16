/*	
	This file is part of JUCI (https://github.com/mkschreder/juci.git)

	Copyright (c) 2015 Martin K. Schröder <mkschreder.uk@gmail.com>

	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
*/ 

(function(scope){
	//var JUCI = exports.JUCI; 
	var $rpc = scope.UBUS; 
	
	function DefaultValidator(){
		this.validate = function(field){
			return null; // return null to signal that there was no error
		}
	}
	
	function TimeValidator(){
		this.validate = function(field){
			var parts = field.value.split(":");
			if(parts.length != 2) return gettext("please specify both hour and minute value for time separated by ':'"); 
			if(parts[0].length <= 2 && Number(parts[0]) >= 0 && Number(parts[0]) < 24 && 
				parts[1].length <= 2 && Number(parts[1]) >= 0 && Number(parts[1]) < 60){
				return null; 
			} else {
				return gettext("please enter valid time in form hh:mm"); 
			}
		}
	}
	
	function TimespanValidator(){
		var timeValidator = new TimeValidator(); 
		this.validate = function(field){
			var parts = field.value.split("-"); 
			if(parts.length != 2) return gettext("Please specify both start time and end time for schedule!"); 
			var err = timeValidator.validate({ value: parts[0] }) || 
				timeValidator.validate({ value: parts[1] }); 
			if(err) return err; 
			
			function split(value) { return value.split(":").map(function(x){ return Number(x); }); };
			var from = split(parts[0]);
			var to = split(parts[1]); 
			if((from[0]*60+from[1]) < (to[0]*60+to[1])) {
				return null; 
			} else {
				return gettext("Schedule start time must be lower than schedule end time!"); 
			}
		}
	}
	
	function WeekDayListValidator(){
		this.validate = function(field){
			// note: can never happen because Arrays are now validated such that you can not set a value that is not an array
			//if(!(field.value instanceof Array)) return gettext("Weekdays field is not an array. This is most probably a bug in the software that has to be fixed!"); 
			var days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
			var invalid = field.value.find(function(x){
				x = String(x).toLowerCase();
				var r = days.find(function(d){
					return d == x;
				});
				return r == undefined;
			}); 
			if(invalid != undefined) return gettext("Please pick days between mon-sun!"); 
			return null; 
		}
	}

	function PortValidator(){
		this.validate = function(field){
			if(field.value == "") return null; 
			var is_range = String(field.value).indexOf("-") != -1; 
			var parts = String(field.value).split("-"); 
			if(is_range && parts.length > 2) return gettext("Port range must have start and end port!"); 
			var invalid = parts.find(function(x){ return !String(x).match(/^\d+$/) || Number(x) < 1 || Number(x) > 65535; }); 
			if(invalid != undefined) return gettext("Invalid port number (must be a number between 1 and 65535!)"+" ("+invalid+")"); 
			if(is_range && Number(parts[0]) > Number(parts[1])) return gettext("Start port must be smaller or equal to end port!"); 
			return null; 
		};
	}
	
	function NumberLimitValidator(min, max){
		return function(){
			this.validate = function(field){
				if(field.value >= min && field.value <= max) return null; 
				return gettext("Number value is not within valid range") + " ("+min+"-"+max+")"; 
			}
		}
	}

	function IP4AddressValidator(){
		this.validate = function(field){
			var error = gettext("IP Address must be a valid IPv4 address!");
			if(field.value == "0.0.0.0") return error;
			if(!field.value || field.value == "") return null;
			if(field.value.match(/^[\.\d]+$/) == null) return error;
			if(field.value.split(".").length != 4 || field.value.split(".")
				.filter(function(part){ return (part !="" && (parseInt(part) < 255))}).length != 4) return error;
			return null;
		}
	};

	function IP6AddressValidator(){
		this.validate = function(field){
			if(field.value && !field.value.match("^((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*::((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*|((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4})){7}$")) return gettext("Address must be a valid IPv6 address"); 
			return null;
		}
	};


	function IP4MulticastAddressValidator(){
		this.validate = function(field){
			if(!field.value || field.value == "") return null;
			var error = gettext("Address is not a valid  Multicast address");
			var ipv4 = new IP4AddressValidator();
			if(ipv4.validate(field) != null) return error;
			var first = parseInt(field.value.split(".")[0]);
			if(first > 239 || first < 224) return error;
			return null;
		}
	};

	function IP4UnicastAddressValidator(){
		this.validate = function(field){
			if(!field.value || field.value == "") return null;
			if(field.value == "0.0.0.0") return gettext("IP Address is not a valid Unicast address!");
			var ip4 = new IP4AddressValidator();
			var error = ip4.validate(field); 
			if(error != null) return error;
			var ip4multi = new IP4MulticastAddressValidator();
			error = ip4multi.validate(field); 
			if(error == null) return gettext("IP Address is not a valid Unicast address!");;
			return null;
		};
	};

	function IP4CIDRValidator(){
		this.validate = function(field){
			if(!field.value || field.value == "") return null;
			var ipv4 = new IP4AddressValidator();
			var parts = field.value.split("/"); 
			var err = ipv4.validate({ value: parts[0] });
			if(err) return err;
			if(parts.length == 1) return null;
			var mask = parseInt(parts[1]);
			if(!isNaN(mask) && mask >= 0 && mask <= 32) return null; 
			return gettext("Netmask must be a value between 0 and 32");
		};
	};

	function IP6CIDRValidator(){
		this.validate = function(field){
			if(!field.value || field.value == "") return null;
			var ip = new IP6AddressValidator();
			var parts = field.value.split("/"); 
			var err = ip.validate({ value: parts[0] });
			//if(err) return err;
			if(parts.length == 1) return null;
			var mask = parseInt(parts[1]);
			if(!isNaN(mask) && mask >= 0 && mask <= 128) return null; 
			return gettext("Netmask must be a value between 0 and 128");
		};
	};

	function IPAddressValidator(){
		this.validate = function(field){
			var ipv4 = (new IP4AddressValidator()).validate(field);
			var ipv6 = (new IP6AddressValidator()).validate(field);
			if(ipv4 && ipv6) return gettext("IP address must be an either valid IPv4 or IPv6 address!"); 
			return null; 
		}
	}; 
	
	function IPCIDRAddressValidator(){
		this.validate = function(field){
			var ipv4 = (new IP4CIDRValidator()).validate(field);
			var ipv6 = (new IP6CIDRValidator()).validate(field);
			if(ipv4 && ipv6) return gettext("IP address must be an either valid IPv4 or IPv6 CIDR address!"); 
			return null; 
		};
	};

	function IP4NetmaskValidator(){
		this.validate = function(field){
			var error = gettext("Netmask must be a valid IPv4 netmask");
			if(!field.value || field.value == "") return null;
			var parts = field.value.split(".");
			if(parts.length != 4) return error;
			if(parts.find(function(x){ return Number(x) < 0 || Number(x) > 255; }) != undefined) return error;
			// make sure mask follows the pattern of first all ones and then all zeros at the end
			if(!parts.map(function(part){return ("00000000" + (parseInt(part) >>> 0)
				.toString(2)).slice(-8);}).join("").match(/^1+0+$/)) return error;
			return null;
		}
	};

	function MACAddressValidator(){
		this.validate = function(field){
			if(!(typeof field.value == "string") ||
				!field.value.match(/^(?:[A-Fa-f0-9]{2}[:-]){5}(?:[A-Fa-f0-9]{2})$/)) 
				return gettext("Value must be a valid MAC-48 address"); 
			return null; 
		}
	};	 

	function MACListValidator(){
		this.validate = function(field){
			// note: never true because it is impossible to set non array value on an array field
			//if(!(field.value instanceof Array)) return gettext("MAC address list must be an array of items!");
			var errors = []; 
			field.value.map(function(value){
				if(!value.match(/^(?:[A-Fa-f0-9]{2}[:-]){5}(?:[A-Fa-f0-9]{2})$/))
					errors.push(gettext("value must be a valid MAC-48 address")+": "+value); 
			}); 
			if(errors.length) return errors.join(", "); 
			return null;
		}
	}; 

	function ArrayValidator(itemValidator, unique){
		return function ArrayValidatorImpl(){
			this.validate = function(field){
				// using array validator on nonarray fields makes no sense
				if(field.schema.type != Array) return null;

				if(!(itemValidator instanceof Function)) {
					console.error("Item validator is not a function: "+typeof itemValidator+", "+JSON.stringify(itemValidator));
					return null;
				}

				function hasDuplicates(arr){
					var sorted_list = arr.sort();
					for(var i = 0; i < sorted_list.length -1; i++){
						if(sorted_list[i+1] == sorted_list[i]) return true;
					}
					return false;
				};

				// create an instance of the validator if validator is a function
				// this fixes the issue of using ItemValidator both inside array validator and as a standalone validator
				// TODO: proper fix by making all validators use the same format that supports validators that take custom options. Currently complex validators are highly unintuitive to create.  
				var validator = new itemValidator(); 

				var notsame = false;

				if(unique && hasDuplicates(field.value)){
					return gettext("Array may not contain duplicates!");
				}

				var errors = field.value.map(function(x){
					if(!validator.validate){
						// check if we have a basic type
						var v = itemValidator;
						if(v == String || v == Number || v == Boolean){
							if(typeof x != typeof v()){
								console.log("value "+x+" not instance of "+v);
								notsame = true;
							}
						}
						return null; 
					}
					return validator.validate({value: x}); 
				}).filter(function(x){ return !!x;}); 

				if(notsame) return gettext("All items in the array must have the same type");
				if(!errors.length) return null; 
				return errors; 
			}
		}
	}

	
	var section_types = {};
	function UCI(){
		this.validators = {
			WeekDayListValidator: WeekDayListValidator, 
			TimespanValidator: TimespanValidator, 
			PortValidator: PortValidator, 
			NumberLimitValidator: NumberLimitValidator, 
			TimeValidator: TimeValidator,
			MACAddressValidator: MACAddressValidator,
			MACListValidator: MACListValidator,
			IPAddressValidator: IPAddressValidator,
			IP6AddressValidator: IP6AddressValidator,
			IP4AddressValidator: IP4AddressValidator,
			IP4NetmaskValidator: IP4NetmaskValidator,
			IP4MulticastAddressValidator: IP4MulticastAddressValidator,
			IP4CIDRValidator: IP4CIDRValidator,
			IP6CIDRValidator: IP6CIDRValidator,
			IPCIDRAddressValidator: IPCIDRAddressValidator,
			IP4UnicastAddressValidator: IP4UnicastAddressValidator,
			ArrayValidator: ArrayValidator
		}; 
	}
	(function(){
		function UCIField(value, schema){
			// set default value to either specified default or to default value of the given type
			/*
			if(value instanceof Array) {
				this.ovalue = []; 
				if(value) Object.assign(this.ovalue, value); 
			} else if(schema.dvalue != undefined){
				this.ovalue = schema.dvalue;
			} else if(schema.type instanceof Function){
				this.ovalue = schema.type(); 
			}
			*/
			this.ovalue = (value != undefined)?value:schema.dvalue;
			this.uvalue = this.ovalue; 
			this.schema = schema; 
			this.is_dirty = false;

			// create the field validator
			if(schema.validator) this.validator = new schema.validator(); 
			else this.validator = new DefaultValidator(); 
		}
		UCIField.prototype = {
			$reset: function(){
				this.uvalue = undefined; //this.ovalue; 
				this.is_dirty = false;
			}, 
			$reset_defaults: function(){
				this.uvalue = this.schema.dvalue;
			},
			/*
			$begin_edit: function(){
				this.svalue = this.value; 
			},
			$cancel_edit: function(){
				if(this.svalue != undefined) this.value = this.svalue; 
			},
			*/
			$update: function(value, keep_user){
				if(value == undefined) return;
				if(this.dvalue instanceof Array){
					if(!(value instanceof Array)) return; // skip an update without valid value
					if(!this.ovalue) this.ovalue = [];
					if(!this.uvalue) this.uvalue = [];
					// if user has modified value and we have keep user set then we do not discard his changes
					// otherwise we also update uvalues

					if(!keep_user || !this.dirty) {
						this.uvalue.length = 0; 
						Object.assign(this.uvalue, value); 
					}
					// store original value
					this.ovalue.length = 0; 
					Object.assign(this.ovalue, value); 
				} else {
					if(!keep_user || !this.dirty) {
						this.uvalue = value; 
					} 
					this.ovalue = value; 
				}
			}, 
			$commit: function(){
				this.ovalue = this.value;
				//this.$update(this.uvalue, false); 
			},
			get dvalue(){
				return this.schema.dvalue;
			},
			get value(){
				// for value we return either uvalue or ovalue or dvalue
				var uvalue = (this.uvalue == undefined)?this.ovalue:this.uvalue; 
				if(uvalue == undefined) uvalue = this.schema.dvalue;
				// make sure that for most types we explicitly make sure that the returned type of variable is of the same type as the schema type
				if(this.schema.type == Boolean){
					if(uvalue === "true" || uvalue === "1" || uvalue === "on" || uvalue === "yes") return true; 
					else if(uvalue === "false" || uvalue === "0" || uvalue === "off" || uvalue === "no") return false; 
					// this will at least make sure we return a boolean
					return Boolean(uvalue);
				} else if(this.schema.type == Number){
					return Number(uvalue);
				} else if(this.schema.type == String){
					return String(uvalue);
				} else if(this.schema.type == Array){
					if(!(uvalue instanceof Array)){
						return Array(uvalue);
					}
					return uvalue;
				}
				//if(this.schema.type) console.error("Field type is not handled: "+this.schema.type);
				// if all else fails then return uvalue
				return uvalue;
			},
			set value(val){
				// set dirty if not same
				var self = this; 
		
				// undefined is a special case and right now we just refuse to set it. 
				if(val == undefined) return;

				// handle type conversions
				var orig = this.uvalue;
				if( self.schema.type == Number) {
					if(typeof val != "number"){
						// try to do type conversion
						var num = Number(val);
						if(!isNaN(num)) this.uvalue = num; 
					} else {
						this.uvalue = val;
					}
				} else if(self.schema.type == String){
					// for strings we can always just do this
					this.uvalue = String(val);
				} else if(this.schema.type == Boolean){
					// for booleans we need to take into account what the config expects
					// some configs use yes/no, some on/off, some 0/1 or "true"/"false"
					var oval = null;
					if(this.ovalue != undefined) oval = this.ovalue;
					else if(this.dvalue != undefined) oval = this.dvalue;

					if(["on", "off"].indexOf(oval) != -1) { 
						this.uvalue = (val)?"on":"off"; 
					} else if(["yes", "no"].indexOf(oval) != -1) {
						this.uvalue = (val)?"yes":"no";
					} else if(["true", "false"].indexOf(oval) != -1) { 
						this.uvalue = (val)?"true":"false"; 
					} else if([true, false].indexOf(oval) != -1 && typeof val == "boolean"){
						this.uvalue = val; 
					}
				} else if(self.schema.type == Array){
					if(val.length == undefined || !(val instanceof Array)){ // TODO: maybe do better identification of arrays (they appear as objects)
						// in case of arrays we do not generate a valid value unless user supplies an array
						// return;
					} else {
						this.uvalue = []; 
						Object.assign(this.uvalue, val); 
					}
				}
				this.is_dirty = orig != this.uvalue;
			},
			get error(){
				// make sure that fields that user did not modify do not return errors
				if(!this.dirty) return null;
				// make sure we ignore errors if value is default and was not changed by user
				if(this.uvalue == this.schema.dvalue || this.uvalue == this.ovalue) return null; 
				if(this.validator) return this.validator.validate(this); 
				return null; 
			},
			get valid(){
				// make sure that fields that user did not modify do not return errors
				if(!this.dirty) return null;
				return this.error == null; 
			}, 
			get dirty(){
				if(this.uvalue == undefined) return false;
				if(this.schema.type == Array && 
					// our arrays never contain objects so we can do this
					(JSON.stringify(this.uvalue) == JSON.stringify(this.ovalue))) return false; 
				else if(this.uvalue === this.ovalue) return false; 
				return this.is_dirty; 
			}
		}
		UCI.Field = UCIField; 
	})(); 
	(function(){
		function UCISection(config){
			this[".config"] = config; 
			this.__defineSetter__("validator", function(value){
				this[".user_validator"] = value; 
			}); 
		}
		
		UCISection.prototype.$update = function(data, opts){
			if(!opts) opts = {}; 
			if(!(".type" in data)) {
				console.error("Supplied object does not have required '.type' field!"); 
				return;
			}
			// try either <config>-<type> or just <type>
			var sconfig = section_types[this[".config"][".name"]]; 
			if(!sconfig) {
				console.error("Missing type definition for config "+this[".config"][".name"]+"!"); 
				return;
			}
			var type = 	sconfig[data[".type"]]; 
			if(!type) {
				console.error("Section.$update: unrecognized section type "+this[".config"][".name"]+"-"+data[".type"]); 
				return; 
			}
			var self = this; 
			self[".original"] = data; 
			self[".name"] = data[".name"]; 
			self[".type"] = data[".type"]; 
			self[".section_type"] = type; 
			
			Object.keys(type).map(function(k){
				var field_type = type[k];
				try{
					if(!(k in self)) { 
						self[k] = new UCI.Field(data[k], field_type);
					} else if(k in data) {
						self[k].$update(data[k], opts.keep_user_changes);
					}
				} catch(e){
					console.error(e);
				}
			}); 
		}
		
		UCISection.prototype.$sync = function(opts){
			var deferred = $.Deferred(); 
			var self = this; 
			if(!opts) opts = {};

			if(!$rpc.uci) {
				setTimeout(function(){ 
					console.error("RPC uci object does not exist! Can not sync!"); 
					deferred.reject(); 
				}, 0); 
				return deferred.promise(); 
			}
			
			$rpc.uci.get({
				config: self[".config"][".name"], 
				section: self[".name"]
			}).done(function(data){
				if(data.values == undefined){
					deferred.reject();
					return;
				}
				self.$update(data.values, opts);
				deferred.resolve(); 
			}).fail(function(){
				deferred.reject(); 
			}); 
			return deferred.promise(); 
		}
			
		UCISection.prototype.$delete = function(){
			var self = this; 
			if(self[".config"]) return self[".config"].$deleteSection(self); 
			var def = $.Deferred(); 
			setTimeout(function(){
				def.reject(); 
			}, 0); 
			return def.promise(); 
		}
		
		UCISection.prototype.$reset = function(){
			var self = this; 
			Object.keys(self).map(function(k){
				if(!(self[k] instanceof UCI.Field)) return;
				self[k].$reset(); 
			}); 
		}
		UCISection.prototype.$commit = function(){
			var self = this; 
			Object.keys(self).map(function(k){
				if(!(self[k] instanceof UCI.Field)) return;
				self[k].$commit(); 
			}); 
		}
		UCISection.prototype.$reset_defaults = function(exc){
			var self = this;
			var exceptions = {}
			if(exc && exc instanceof Array)
				exc.map(function(e){ exceptions[e] = true;});
			Object.keys(self).map(function(k){
				if(!(self[k] instanceof UCI.Field) || exceptions[k]) return;
				self[k].$reset_defaults();
			});
		}

		UCISection.prototype.$getErrors = function(){
			var errors = []; 
			var self = this; 
			var type = self[".section_type"]; 
			Object.keys(type).map(function(k){
				var err = self[k].error; 
				if(err){
					errors.push(k+": "+err); 
				}
			}); 
			var type = this[".section_type"]; 
			// support user defined validators for a section
			var uval = this[".user_validator"]; 
			if(uval && uval instanceof Function){
				try {
					var e = uval(self); 
					if(e) errors.push(e); 
				} catch(e){
					errors.push(e); 
				}
			}
			if(type && type[".validators"]){
				type[".validators"].map(function(val){
					if(!(val instanceof Function)) return; 
					try {
						var e = val(self); 
						if(e) errors.push(e); 
					} catch(e){
						errors.push(e); 
					}
				}); 
			}
			return errors; 	
		}
		
		UCISection.prototype.$getChangedValues = function(){
			var type = this[".section_type"]; 
			if(!type) return {}; 
			var self = this; 
			var changed = {}; 
			
			//if(type[".validator"] instanceof Function) type[".validator"](self); 
			
			Object.keys(type).map(function(k){
				if(self[k] && self[k].dirty){ 
					//console.log("Adding dirty field: "+k); 
					changed[k] = self[k].uvalue; 
				}
			}); 
			return changed; 
		}
		UCI.Section = UCISection; 
	})(); 
	(function(){
		function UCIConfig(uci, name){
			var self = this; 
			self.uci = uci; 
			self[".name"] = name; 
			self["@all"] = []; 
			if(!name in section_types) {
				console.error("Missing type definition for config!");
				throw new Error("Missing type definition for config "+name); 
			}
			
			// set up slots for all known types of objects so we can reference them in widgets
			Object.keys(section_types[name]||{}).map(function(type){
				self["@"+type] = []; 
			}); 
			//this["@deleted"] = []; 
		}
		
		function _insertSection(self, item){
			// experimental feature for hiding sections from interface 
			if(item["do_not_edit"] || item["juci_hide"]) return; 

			//console.log("Adding local section: "+self[".name"]+"."+item[".name"]); 
			var section = new UCI.Section(self); 
			section.$update(item); 
			var type = "@"+item[".type"]; 
			if(!(type in self)) self[type] = []; 
			self[type].push(section); 
			self["@all"].push(section); 
			if(item[".name"]) self[item[".name"]] = section; 
			return section; 
		}
		
		function _unlinkSection(self, section){
			// NOTE: can not use filter() because we must edit the list in place 
			// in order to play well with controls that reference the list! 
			console.log("Unlinking local section: "+self[".name"]+"."+section[".name"]+" of type "+section[".type"]); 
			var all = self["@all"]; 
			for(var i = 0; i < all.length; i++){
				if(all[i][".name"] === section[".name"]) {
					all.splice(i, 1); 
					break; 
				}; 
			}
			var jlist = self["@"+section[".type"]]||[]; 
			for(var j = 0; j < jlist.length; j++){
				if(jlist[j][".name"] === section[".name"]) {
					jlist.splice(j, 1); 
					break; 
				}
			}
			if(section[".name"]) delete self[section[".name"]]; 
		}
			
		UCIConfig.prototype.$commit = function(){
			var errors = [];
			var self = this;  
			Object.keys(self).map(function(x){
				if(self[x] && self[x].constructor == UCI.Section) {
					if(self[x].$commit) self[x].$commit(); 
				}
			}); 
			self[".need_commit"] = false; 
			return errors; 
		}

		UCIConfig.prototype.$getErrors = function(){
			var errors = [];
			var self = this;  
			Object.keys(self).map(function(x){
				if(self[x] && self[x].constructor == UCI.Section) {
					self[x].$getErrors().map(function(e){
						if(e instanceof Array){
							errors = errors.concat(e.map(function(err){ return self[".name"]+"."+x+": "+err;}));
						}else{
							errors.push(self[".name"]+"."+x+": "+e);
						}
					}); 
				}
			}); 
			return errors; 
		}
		
		UCIConfig.prototype.$reset = function(){
			var self = this; 
			Object.keys(self).map(function(x){
				if(self[x] && self[x].constructor == UCI.Section){
					self[x].$reset(); 
					// TODO: this should be made to work such that if we reset we only delete sections that have not been commited yet
					//if(self[x][".new"]) self[x].$delete(); 
				}
			}); 
			//self[".need_commit"] = false; 
		}

		UCIConfig.prototype.$mark_for_reload = function(){
			this.deferred = null; 
		}
		
		UCIConfig.prototype.$sync = function(opts){
			var deferred = $.Deferred(); 
			var self = this; 
			if(!opts) opts = {}; 
			
			if(!opts.reload && self.deferred && self.deferred.state() != "rejected") return self.deferred.promise(); 
			
			self.deferred = deferred; 

			if(!$rpc.uci) {
				// this will happen if there is no router connection!
				setTimeout(function(){ 
					console.error("uci is not defined!");
					deferred.reject();
				}, 0); 
				return deferred.promise(); 
			}

			var to_delete = {}; 
			Object.keys(self).map(function(x){
				// prevent deletion of automatically created type sections with default value which are created by registerSectionType..
				if(self[x].constructor == UCI.Section && self[x][".type"] != self[x][".name"]) to_delete[x] = self[x]; 
			}); 
			//console.log("To delete: "+Object.keys(to_delete)); 
		
			$rpc.uci.get({
				config: self[".name"]
			}).done(function(data){
				var vals = data.values;
				if(vals == undefined){
					deferred.reject(); 
					return;
				}
				// go through each section in the result and update it
				Object.keys(vals).filter(function(x){
					return vals[x][".type"] in section_types[self[".name"]]; 
				}).map(function(k){
					if(!(k in self)) _insertSection(self, vals[k]); 
					else {
						var section = self[vals[k][".name"]]; 
						section.$update(vals[k], opts); 
					}
					delete to_delete[k]; 
				}); 
				
				// now delete any section that no longer exists in our local cache
				Object.keys(to_delete).map(function(x){
					if(!to_delete[x]) return;
					var section = to_delete[x]; 
					_unlinkSection(self, section); 
				});
				deferred.resolve();
			}).fail(function(){
				deferred.reject(); 
			}); 
			return deferred.promise(); 
		}
		
		UCIConfig.prototype.$registerSectionType = function(name, descriptor, validator){
			var config = this[".name"]; 
			var conf_type = section_types[config]; 
			if(name in conf_type) console.warn("Section "+name+" already defined. Will extend existing section! If this is not your intention, fix your code!"); 
			if(typeof conf_type === "undefined") conf_type = section_types[config] = {}; 
			// either create a new type or extend/overwrite existing field definitions 
			if(!conf_type[name]) conf_type[name] = descriptor; 
			else Object.keys(descriptor).map(function(k){
				conf_type[name][k] = descriptor[k];  
			}); 
			// add an empty list of sections of this type
			if(!this["@"+name]) this["@"+name] = []; 
			// add validator
			if(!conf_type[name][".validators"]) conf_type[name][".validators"] = []; 
			if(validator !== undefined && validator instanceof Function) conf_type[name][".validators"].push(validator); 
			//console.log("Registered new section type "+config+"."+name); 
		}
		
		UCIConfig.prototype.$insertDefaults = function(typename, sectionname){
			if(!sectionname) sectionname = typename; 
			//console.log("Adding new defaults section: "+JSON.stringify(values)); 
			// insert a default section with the same name as the type
			// this allows us to use $uci.config.section.setting.value without having to first check for the existence of the section.
			// we will get defaults by default and if the section exists in the config file then we will get the values from the config.
			_insertSection(this, { ".type": typename, ".name": sectionname});  
		}

		UCIConfig.prototype.$deleteSection = function(section){
			var self = this; 
			var deferred = $.Deferred(); 
				
			if(!$rpc.uci) {
				// this will happen if there is no router connection!
				setTimeout(function(){ deferred.reject(); }, 0); 
				return deferred.promise(); 
			}

			//self[".need_commit"] = true; 
			console.log("Removing section "+JSON.stringify(section[".name"])); 
			$rpc.uci.delete({
				"config": self[".name"], 
				"section": section[".name"]
			}).done(function(){
				_unlinkSection(self, section); 
				console.log("Deleted section "+self[".name"]+"."+section[".name"]); 
				//self[".need_commit"] = true; 
				deferred.resolve(); 
			}).fail(function(){
				console.error("Failed to delete section!"); 
				deferred.reject(); 
			}); 
			return deferred.promise(); 
		}
		
		UCIConfig.prototype.$create = function(item, offline){
			var self = this; 
			var deferred = $.Deferred(); 

			if(!(".type" in item)) {
				console.error("Missing '.type' parameter in call to $create!");
				setTimeout(function(){ deferred.reject(); }, 0);
				return deferred.promise();
			}

			var type = section_types[self[".name"]][item[".type"]]; 
			if(!type) {
				console.error("Trying to create section of unrecognized type ("+self[".name"]+"."+item[".type"]+")"); 
				setTimeout(function(){ deferred.reject(); }, 0);
				return deferred.promise();
			}
			
			if(!$rpc.uci) {
				// this will happen if there is no router connection!
				setTimeout(function(){ deferred.reject(); }, 0); 
				return deferred.promise(); 
			}

			// TODO: validate values!
			var values = {}; 
			Object.keys(type).map(function(k){ 
				if(k in item && item[k] != null && item[k] != undefined) values[k] = item[k]; 
				else if(type[k].dvalue != null && type[k].dvalue != undefined){
					values[k] = type[k].dvalue; 
				}
			}); 
			
			if((".name" in item) && (item[".name"] in self)){ // section with specified name already exists
				setTimeout(function(){
					deferred.reject("Section with name "+item[".name"]+" already exists in config "+self[".name"]); 
				}, 0); 
				return deferred.promise(); 
			}
				
			console.log("Adding: "+JSON.stringify(item)+" to "+self[".name"]+": "+JSON.stringify(values)); 
			$rpc.uci.add({
				"config": self[".name"], 
				"type": item[".type"],
				"name": item[".name"], 
				"values": values
			}).done(function(state){
				console.log("Added new section: "+JSON.stringify(state)); 
				item[".name"] = state.section; 
				self[".need_commit"] = true; 
				var section = _insertSection(self, item); 
				section[".new"] = true; 
				deferred.resolve(section); 
			}).fail(function(){
				deferred.reject(); 
			});
			return deferred.promise(); 
		}
	
		/**
		 * Tells uci to reorder sections based on current order in the section types table.
		 */
		UCIConfig.prototype.$save_order = function(type){
			var def = $.Deferred(); 
			var arr = this["@"+type]; 
			var self = this; 
			if(!arr){
				console.error("UCI."+self[".name"]+".$reorder: section "+type+" is unknown!"); 
				setTimeout(function(){ def.reject(); }, 0); 
				return def.promise(); 
			}
			// get section order and send it to uci. This will be applied when user does $save(); 
			var order = arr.map(function(x){ return x[".name"]; }).filter(function(x){ return x; }); 
			$rpc.uci.order({ 
				config: self[".name"], 
				sections: order
			}).done(function(){ def.resolve(); }).fail(function(){ def.reject(); });
			return def.promise(); 
		}
		
		UCIConfig.prototype.$getWriteRequests = function(){
			var self = this; 
			var reqlist = []; 
			self["@all"].map(function(section){
				var changed = section.$getChangedValues(); 
				//console.log(JSON.stringify(changed) +": "+Object.keys(changed).length); 
				if(Object.keys(changed).length){
					reqlist.push({
						"config": self[".name"], 
						"section": section[".name"], 
						"values": changed
					}); 
				}
			}); 
			return reqlist; 
		}
		
		UCI.Config = UCIConfig; 
	})(); 
	
	UCI.prototype.$init = function(){
		var deferred = $.Deferred(); 
		console.log("Init UCI"); 
		var self = this; 

		if(!$rpc.uci) {
			console.error("No uci rpc object present!"); 
			setTimeout(function(){ deferred.reject(); }, 0); 
			return deferred.promise(); 
		}
		
		$rpc.uci.configs().done(function(response){
			var cfigs = response.configs; 
			if(!cfigs) { console.error("No configs found!"); deferred.reject(); return; }
			cfigs.map(function(k){
				if(!(k in section_types)) {
					console.log("Missing type definition for config "+k); 
					return; 
				}
				if(!(k in self)){
					//console.log("Adding new config "+k); 
					self[k] = new UCI.Config(self, k); 
					self[k]._exists = true; // mark that we have this config
				} else {
					self[k]._exists = true; // mark that we have this config
				}
			}); 
			deferred.resolve(); 
		}).fail(function(){
			deferred.reject(); 
		}); 
		return deferred.promise(); 
	}
	
	// returns true if there are uci changes
	UCI.prototype.$hasChanges = function(){
		var self = this; 
		return !!Object.keys(self).find(function(x){ 
			if(self[x].constructor != UCI.Config) return false; 
			//if(self[x][".need_commit"]) return true; 
			if(self[x].$getWriteRequests().length) return true; 
			return false; 
		}); 
	}

	UCI.prototype.$getErrors = function(){
		var self = this; 
		var errors = []; 
		Object.keys(self).map(function(x){
			if(!self[x] || self[x].constructor != UCI.Config) return; 
			errors = errors.concat(self[x].$getErrors()); 
		}); 
		return errors; 
	}

	var prev_changes = []; 
	var prev_time = (new Date()).getTime(); 
	UCI.prototype.$getChanges = function(){
		var changes = []; 
		var self = this; 
		
		// prevent this function from running more often than once a second
		//var now = (new Date()).getTime(); 
		//if(now < (prev_time + 1000)) return prev_changes; 
		//prev_time = now; 

		Object.keys(self).map(function(x){
			if(!self[x] || self[x].constructor != UCI.Config) return; 
			/*
			if(self[x][".need_commit"]){
				changes.push({
					type: "config", 
					config: self[x][".name"]
				}); 
			}
			*/
			/*Object.keys(self[x]).map(function(k){
				var section = self[x][k]; 
				if(section[".new"]) changes.push({ 
					type: "add",
					config: self[x][".name"], 
					section: section[".name"]
				}); 
			});*/  
			self[x].$getWriteRequests().map(function(ch){
				Object.keys(ch.values).map(function(opt){
					var o = self[x][ch.section][opt]; 
					if(o.dirty){
						changes.push({
							type: "option", 
							config: self[x][".name"], 
							section: self[x][ch.section][".name"],
							option: opt, 
							uvalue: o.uvalue, 
							ovalue: o.ovalue
						}); 
					}
				}); 
			});
		});
		prev_changes = changes; 
		return changes; 
	}

	// marks all configs for reload on next sync of the config 
	UCI.prototype.$reset = function(){
		var self = this; 
		Object.keys(self).map(function(x){ 
			if(self[x].constructor != UCI.Config) return; 
			self[x].$reset(); 
		}); 
	}

	UCI.prototype.$mark_for_reload = function(){
		var self = this; 
		Object.keys(self).map(function(x){ 
			if(self[x].constructor != UCI.Config) return; 
			self[x].$mark_for_reload(); 
		}); 
	}

	UCI.prototype.$registerConfig = function(name){
		if(!(name in section_types)) section_types[name] = {}; 
		if(!(name in this)) this[name] = new UCI.Config(this, name); 
	}
/*	
	UCI.prototype.$eachConfig = function(cb){
		var self = this; 
		Object.keys(self).filter(function(x){ 
			return self[x].constructor == UCI.Config; 
		}).map(function(x){
			cb(self[x]); 
		});
	}
*/	 
	UCI.prototype.$sync = function(configs){
		var deferred = $.Deferred(); 
		var self = this; 
		
		async.series([
			function(next){
				// make an array of either all configs or just the one user has specified
				if(configs == undefined || configs.length == 0) { 
					// if no argument provided then we sync all configs
					configs = Object.keys(self).filter(function(x){ 
						return self[x].constructor == UCI.Config; 
					}); 
					//next(); return; 
				} else if(!(configs instanceof Array)) {
					configs = [configs]; 
				}
				
				async.eachSeries(configs, function(cf, next){
					// configs may contain invalid ones
					if(!(cf in self)) { 
						// TODO: decide on whether to always resolve if at least one config compiles
						// or to always reject if at least one config fails. 
						console.error("invalid config name "+cf); 
						next(); 
						return; 
					} 
					// sync the config
					self[cf].$sync().done(function(){
						console.log("Synched config "+cf); 
						next(); 
					}).fail(function(){
						console.error("Could not sync config "+cf); 
						next(); // continue because we want to sync as many as we can!
					}); 
				}, function(err){
					next(err); 
				}); 
			}
		], function(err){
			setTimeout(function(){ // in case async did not defer
				if(err) deferred.reject(err); 
				else deferred.resolve(); 
			}, 0); 
		}); 
		return deferred.promise(); 
	}
	
	UCI.prototype.$save = function(){
		var deferred = $.Deferred(); 
		var self = this; 
		var writes = []; 
		var add_requests = []; 
		var errors = []; 
		
		if(!$rpc.uci) {
			setTimeout(function(){ deferred.reject(); }, 0); 
			return deferred.promise(); 
		}

		async.series([
			function(next){ // send all changes to the server
				Object.keys(self).map(function(k){
					if(self[k].constructor == UCI.Config){
						var err = self[k].$getErrors(); 
						if(err && err.length) {
							err.map(function(e){
								console.error("UCI error ["+k+"]: "+e); 
							}); 
							errors = errors.concat(err);
							return; 
						} 
						var reqlist = self[k].$getWriteRequests(); 
						reqlist.map(function(x){ writes.push(x); });  
					}
				}); 
				// push errors to top level if there are errors in config! 
				if(errors.length){
					setTimeout(function(){ deferred.reject(errors); }, 0); 
					return; 
				}
				async.eachSeries(writes, function(cmd, next){
					console.log("Writing changes: "+JSON.stringify(cmd)); 
					$rpc.uci.set(cmd).done(function(response){
						console.log("... "+cmd.config+": "+JSON.stringify(response)); 
						//self[cmd.config][".need_commit"] = true; 
						self[cmd.config].deferred = null; 
						next(); 
					}).fail(function(){
						console.error("Failed to write config "+cmd.config); 
						next(); 
					}); 
				}, function(){
					Object.keys(self).map(function(x){
						if(self[x] instanceof UCI.Config) self[x].$commit(); 
					}); 
					setTimeout(function(){ deferred.resolve();}, 0); 
					next();
				}); 
			}
		]); 
		return deferred.promise(); 
	}

	scope.UCI = new UCI(); 
})(typeof exports === 'undefined'? this : global); 
