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

JUCI.app
.directive("wirelessApsGraph", function($compile, $parse){
	return {
		templateUrl: "/widgets/wireless-aps-graph.html", 
		scope: {
			scan_list: "=ngModel"
		}, 
		controller: "wirelessApsGraph", 
		replace: true 
	 };  
}).controller("wirelessApsGraph", function($scope){
	var	container = document.getElementById('graph');	
	var items = []; 

	var dataset = new vis.DataSet(items);
	var options = {
		start: 0,
		end: 20,
		style: 'bar',
		drawPoints: {
			onRender: function(item, group, grap2d) {
				return item.label != null;
			},
			style: 'circle'
		}
	};
	
	var groups = new vis.DataSet(); 	
	groups.add({
		id: 1,
		className: 'green',
		options: {
			style:'bar',
			drawPoints: { style: 'circle', size: 10 }
		}
	});
	groups.add({
		id: 2,
		className: 'orange',
		options: {
			style:'bar',
			drawPoints: { style: 'circle', size: 10 }
		}
	});
	groups.add({
		id: 3,
		className: 'red',
		options: {
			style:'bar',
			drawPoints: { style: 'circle', size: 10 }
		}
	});

	var graph2d = new vis.Graph2d(container, dataset, groups, options);

	$scope.$watch("scan_list", function onApsGraphScanlistChanged(value){
		if(!value) return; 		
	
		dataset.remove(dataset.getIds()); 
		value.map(function(ap){
			var group = 1; 
			if(ap.snr < 20) group = 3; 
			else if(ap.snr < 60) group = 2; 
			else group = 1; 
			dataset.add({group: group, x: ap.channel, y: String(ap.snr), label: { content: ap.ssid }}); 
		}); 
	}); 
}); 
