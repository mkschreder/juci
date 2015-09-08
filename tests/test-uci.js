#!javascript

//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

require("./lib-juci"); 

describe("UCI", function(){
	beforeEach(function(done){
		$uci.sync().done(function(){
			expect($uci).to.have.property("juci");
			var to_delete = $uci.juci["@test"].map(function(x){
				return x; 
			}); 
			// have to use a copy of the array because deletion modifies the array
			async.eachSeries(to_delete, function(section, next){
				section.$delete().done(function(){
					next(); 
				}).fail(function(){
					throw new Error("Was unable to delete section "+section[".name"]+" from config juci!"); 
				}); 
			}, function(){
				$uci.save().done(function(){
					done(); 
				}); 
			}); 
		}); 
	}); 
	it("should have schema definition for each data field found in each defined uci config", function(done){
		//$uci.sync().done(function(){
			// get all configs that have been successfully loaded
			var configs_map = {} ; 
			$uci.$eachConfig(function(cf){
				configs_map[cf[".name"]] = cf; 
			}); 
			// for each config, retreive the raw data using rpc and compare that all fields in rpc data are present in the uci data
			async.eachSeries(Object.keys(configs_map), function(k, next){
				console.log("Testing config "+k); 
				var cf = configs_map[k]; 
				$rpc.uci.state({config: k}).done(function(result){
					Object.keys(result.values).filter(function(x){
						return x in cf; 
					}).map(function(name){
						var values = result.values[name]; 
						var section = cf[name]; 
						console.log(".. testing section "+name+" of type "+section[".type"]); 
						expect(section).to.be.ok(); 
						var type = section[".section_type"]; 
						expect(type).to.be.ok(); 
						Object.keys(values).filter(function(x){
							return x.indexOf(".") != 0; // filter out hidden values
						}).map(function(x){
							expect(Object.keys(type)).to.contain(x); 
						}); 
					}); 
					next(); 
				}).fail(function(){
					throw new Error("Have not been able to retreive state for config "+k); 
				}); 
			}, function(){
				done(); 
			}); 
		//}); 
	}); 
	// will create an anonymous 'test' section and then delete it, commiting the changes
	it("should be able to add and delete an anonymous section", function(done){
		expect($uci.juci["@test"]).to.be.empty(); 
		$uci.juci.create({".type": "test"}).done(function(section){
			expect($uci.juci["@test"]).to.be.ok(); 
			expect($uci.juci["@test"].length).not.to.be(0); 
			expect($uci.juci["@test"]).to.contain(section); 
			section.str.value = "test"; 
			$uci.save().done(function(){
				$uci.sync("juci").done(function(){
					expect($uci.juci["@test"]).to.contain(section); 
					expect($uci.juci[section[".name"]]).to.be.ok(); 
					expect($uci.juci[section[".name"]].str.value).to.eql("test"); 
					section.$delete().done(function(){
						expect(section[".name"]).to.be.ok(); 
						expect($uci.juci[section[".name"]]).not.to.be.ok(); 
						expect($uci.juci["@test"]).to.be.empty(); 
						$uci.save().done(function(){
							done(); 
						}).fail(function(){
							throw new Error("Was unable to save uci config after deleting section!"); 
						}); 
					}).fail(function(){
						throw new Error("Deleting section has failed!");
					});  
				}).fail(function(){
					throw new Error("Was unable to sync config juci. Check that acl list on the server allows access to juci config!");
				});  
			}).fail(function(){
				throw new Error("Was unable to save newly created section in juci config!"); 
			}); 
		}).fail(function(){
			throw new Error("Was unable to create section 'test' in config juci"); 
		}); 
	}); 
	// will try to resync (old changes should be reverted also on the server)
	it("should remove previously created section if resync is done without saving", function(done){
		expect($uci.juci["@test"]).to.be.empty(); 
		$uci.juci.create({".type": "test"}).done(function(section){
			expect($uci.juci["@test"]).to.contain(section); 
			expect($uci.juci["@test"].length).to.be(1); 
			$uci.sync("juci").done(function(){
				expect($uci.juci["@test"]).to.be.empty(); 
				expect($uci.juci["@test"]).not.to.contain(section);
				$uci.save().done(function(){ // this should not commit previulsy added section!
					$uci.sync("juci").done(function(){
						expect($uci.juci["@test"]).to.be.empty(); 
						expect($uci.juci["@test"]).not.to.contain(section);
						done(); 
					}); 
				}); 
			}).fail(function(){
				throw new Error("Was unable to sync config juci. Check that acl list on the server allows access to juci config!");
			});  
		}).fail(function(){
			throw new Error("Was unable to create section 'test' in config juci"); 
		}); 
	}); 
	it("should be able to add a named section", function(done){
		expect($uci.juci["@test"]).to.be.empty(); 
		$uci.juci.create({".type": "test", ".name": "testname"}).done(function(section){
			expect($uci.juci.testname).to.be.ok(); 
			$uci.save().done(function(){
				$uci.sync("juci").done(function(){
					expect($uci.juci.testname).to.be.ok(); 
					expect($uci.juci["@test"]).to.contain(section); 
					expect($uci.juci["@test"].length).to.be(1); 
					section.$delete().done(function(){
						$uci.save().done(function(){
							done(); 
						}); 
					}); 
				}); 
			}); 
		}).fail(function(){
			throw new Error("Could not create named section in juci config!"); 
		}); 
	}); 
	it("should not be able to add a section that already exists", function(done){
		expect($uci.juci["@test"]).to.be.empty(); 
		$uci.juci.create({".type": "test", ".name": "testname"}).done(function(section){
			$uci.juci.create({".type": "test", ".name": "testname"}).done(function(section2){
				throw new Error("Creating a section that already exists returned success when it should fail!"); 
			}).fail(function(){
				section.$delete().done(function(){
					$uci.save().done(function(){
						done(); 
					}); 
				}); 
			}); 
		}).fail(function(){
			throw new Error("Failed to create section testname when it was supposed to work fine!");  
		}); 
	}); 
}); 
