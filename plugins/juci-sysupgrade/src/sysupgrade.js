//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app.run(function($uci, $rpc, $tr, gettext, upgradePopup){
	var upgrades = []; 
	
	async.series([
		function(next){
			$uci.$sync("system").done(function(){
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
				if(response.all && response.all.length) {
					/*upgradePopup.show({ images: response.all.map(function(x){ return { label: x, value: x }; }) }).done(function(selected){
						$rpc
					}); */
					if(confirm($tr(gettext("A new system software upgrade is available. Do you want to visit upgrade page and upgrade now?")))) {
						window.location = "/#!/settings-upgrade"; 
					}
				} 
				next(); 
			}); 
		}
	], function(){
		
	}); 
}); 
