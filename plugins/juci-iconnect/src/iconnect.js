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
