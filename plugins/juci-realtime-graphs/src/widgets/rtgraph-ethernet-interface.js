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
.directive("rtgraphEthernetInterface", function($compile, $parse){
	return {
		templateUrl: "/widgets/rtgraph-ethernet-interface.html", 
		controller: "rtgraphEthernetInterface", 
		scope: {
			ifname: "=ngModel"
		},
		replace: true, 
		require: "^ngModel"
	 };  
}).controller("rtgraphEthernetInterface", function($scope, $rpc, $element){	
	$scope.$watch("ifname", function(value){
		if(!value) return; 
		var container = $element.find(".rtgraph").get(0); 
		var items = []; 

		var dataset = new vis.DataSet(items);
		var options = {
			start: 0,
			end: 1,
			style: 'line',
			interpolation: false, 
			drawPoints: false
		};
		
		var groups = new vis.DataSet(); 	
		groups.add({
			id: 1,
		});
		groups.add({
			id: 2,
		});

		var graph2d = new vis.Graph2d(container, dataset, groups, options);

		
		JUCI.interval.repeat("graph-update-"+Math.random(), 2000, function(done){
			var start_time = 0; 
			$rpc.juci.rtgraphs.get({ethdevice: $scope.ifname}).done(function(result){
				if(!result.graph || !result.graph.length) return; 
				if(!start_time) start_time = result.graph[0][0]; 
				//dataset.remove(dataset.getIds()); 

				var prev_time = 0; 
				result.graph.forEach(function(line, i){
					if(line[0] <= prev_time) return; 

					if(i > 0){
						var prev_line = result.graph[i-1]; 
						var dt = line[0] - prev_line[0]; 
						var rxs = (line[1] - prev_line[1]) / dt; 
						var txs = (line[3] - prev_line[3]) / dt; 
						if(prev_line[0] > 0 && line[0] > 0 && prev_line[0] < line[0]){
							//for(var c = prev_line[0]; c < line[0]; c++){
								dataset.add({group: 1, x: line[0], y: rxs}); 
								dataset.add({group: 2, x: line[0], y: txs}); 
							//}
						}
					}
				
					prev_time = line[0]; 
				}); 
				graph2d.setWindow(prev_time - 60, prev_time); 
				done(); 
			}); 
		});
	}); 
}); 
