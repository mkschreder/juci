require("../../../../tests/lib-juci"); 
require("./juci.login"); 

describe("core.login", function(){
	var $scope = {}; 
	beforeEach(function() {
		controller("LoginControl", $scope); 
	});
	it("should be able to login", function(done){
		console.log(JSON.stringify(Object.keys($scope))); 
		$scope.form.username = PARAMS.username; 
		$scope.form.password = PARAMS.password; 
		$scope.doLogin().done(function(){
			expect(window.location.href).to.be("/"); 
			done(); 
		}).fail(function(){
			throw new Error("Could not logout: "+$scope.errors);
		});  
	}); 
	it("should not be possible to login with incorrect password", function(done){
		$scope.form.username = PARAMS.username; 
		$scope.form.password = "abrakadabra"; 
		$scope.doLogin().done(function(){
			throw new Error("Was able to login with incorrect password"); 
		}).fail(function(){
			done(); 
		}); 
	}); 
	it("should not be possible to login with incorrect username", function(done){
		$scope.form.username = "abrakadabra"; 
		$scope.form.password = PARAMS.password; 
		$scope.doLogin().done(function(){
			throw new Error("Was able to login with incorrect username"); 
		}).fail(function(){
			done(); 
		}); 
	}); 
	it("should be possible to logout after logging in", function(done){
		$scope.form.username = PARAMS.username; 
		$scope.form.password = PARAMS.password; 
		$scope.doLogin().done(function(){
			$scope.doLogout().done(function(){
				done(); 
			}).fail(function(){
				throw new Error("Was unable to logout!"); 
			}); 
		}).fail(function(){
			throw new Error("Was unable to login!"); 
		}); 
	}); 
}); 
