require("../../../../tests/lib-juci"); 

var completed = {
	"configuration": 1, 
	"energy": 1, 
	"network": 1, 
	"password": 1, 
	"upgrade": 1
}

describe("Settings", function(){
	it("should be completed", function(){
		expect(Object.keys(completed).filter(function(x){ return completed[x] == 0; })).to.be.empty(); 
	}); 
	it("should have required rpc functions", function(){
		expect($rpc.luci2.system.password_set).to.be.a(Function); 
	}); 
	it("should be able to check for online upgrade", function(done){
		$rpc.luci2.system.upgrade_check({type: "online"}).done(function(){
			done(); 
		}).fail(function(){
			throw new Error("Could not check for online upgrade!"); 
		}); 
	}); 
	it("should be able to check for usb upgrade", function(done){
		$rpc.luci2.system.upgrade_check({type: "usb"}).done(function(){
			done();  
		}).fail(function(){
			throw new Error("Could not check for online upgrade!"); 
		}); 
	}); 
	it("should not be able to set password without providing current password", function(done){
		console.log("Trying to set password for user "+PARAMS.username); 
		$rpc.luci2.system.password_set({"user": PARAMS.username, "password": "abrakadabra"}).done(function(){
			// reset password to current password again!
			$rpc.luci2.system.password_set({"user": PARAMS.username, "password": PARAMS.password, "curpass": "abrakadabra"}).always(function(){
				throw new Error("Should not be able to set password without first providing current password!"); 
			}); 
		}).fail(function(){
			done(); 
		}); 
	}); 
	// TODO: this test should not work anyway when current password is a required feature
	it("should not be able to set password for root", function(done){
		if(PARAMS.username != "root"){
			$rpc.luci2.system.password_set({"user": "root", "password": "foo"}).done(function(){
				throw new Error("Should not be able to set password for root when not root (now you have to change it back from 'foo' to your previous password)!"); 
			}).fail(function(){
				done(); 
			}); 
		} else {
			done(); 
		}
	});
	it("should be able to set password for current user", function(done){
		$rpc.luci2.system.password_set({"user": PARAMS.username, "password": PARAMS.password, "curpass": PARAMS.password}).done(function(){
			// TODO: test also to login after changing password to something else!
			done(); 
		}).fail(function(){
			throw new Error("Was unable to execute password_set()"); 
		}); 
	}); 
	it("should be able to access $rpc.$session.data.username and it should be set to the name of the currently logged in user", function(){
		expect($rpc.$session).to.be.ok(); 
		expect($rpc.$session.data.username).to.be.eql(PARAMS.username); 
	}); 
}); 
