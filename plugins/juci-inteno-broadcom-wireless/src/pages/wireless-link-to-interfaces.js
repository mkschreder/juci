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

// this page is a placeholder for providing link to wireless interfaces page in places like network devices. 
JUCI.app
.controller("wirelessLinkToInterfacesPage", function($scope, $uci, $tr, gettext){
	$scope.wifi_link = "<a href='#!/wireless-interfaces'>"+$tr(gettext("Wireless Interfaces"))+"</a>"; 
}); 
