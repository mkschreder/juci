UCI.juci.$registerSectionType("iconnect", {
	"username": { dvalue: "", type: String }, 
	"password": { dvalue: "", type: String }
}); 

JUCI.app.run(function($config, $rpc, $window){
	setTimeout(function(){
		if(!$config.settings.iconnect || $config.settings.iconnect.username.value == "") return; 
		$rpc.$login({
			"username": $config.settings.iconnect.username.value, 
			"password": $config.settings.iconnect.password.value, 
		}).done(function success(res){
			//$state.go("home", {}, {reload: true});
			$window.location.href="/#!iconnect-overview"; 
		}); 
	}, 2000); 
}); 
