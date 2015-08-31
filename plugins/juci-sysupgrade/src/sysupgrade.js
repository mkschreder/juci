//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app.run(function($uci){
	var upgrades = []; 
	/*
	async.series([
		function(next){
			$uci.sync("system").done(function(){
				if(!$uci.system.upgrade) {
					$uci.system.create({ ".type": "upgrade", ".name": "upgrade" }).done(function(section){
						$uci.save().done(function(){
							console.log("Created missing section system.upgrade in UCI!"); 
							next(); 
						}); 
					}); 
				} else {
					next(); 
				}
			}); 
		}, 
		function(next){
			$rpc.juci.system.upgrade.check().done(function(response){
				if(response.all.length) {
					upgrades = response.all; 
				} 
				next(); 
			}); 
		}
	], function(){
		
	}); */
}); 
