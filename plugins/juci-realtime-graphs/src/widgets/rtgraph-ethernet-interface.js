//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
//! Copyright (c) 2015

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
		$rpc.juci.rtgraphs.get({ethdevice: $scope.ifname}).done(function(result){
			var container = $element.find(".rtgraph").get(0); 
			var items = []; 

			var dataset = new vis.DataSet(items);
			var options = {
				start: result.graph[0][0],
				end: result.graph[result.graph.length-1][0],
				style: 'line',
				interpolation: false, 
				drawPoints: false
			};
			
			var groups = new vis.DataSet(); 	
			groups.add({
				id: 1,
				options: {
					style:'line',
					drawPoints: false //{ style: 'none', size: 10 }
				}
			});
			groups.add({
				id: 2,
				options: {
					style:'line',
					drawPoints: false //{ style: 'none', size: 10 }
				}
			});

			var graph2d = new vis.Graph2d(container, dataset, groups, options);

			dataset.remove(dataset.getIds()); 
			
			var prev = []; 
			result.graph.forEach(function(line, i){
				if(i > 0){
					var dt = line[0] - prev[0]; 
					line[1] = (line[1] - prev[1]) / dt; 
					line[3] = (line[3] - prev[3]) / dt; 
				}
				line.forEach(function(x, i){ prev[i] = x; }); 
			}); 
			result.graph.map(function(line){
				dataset.add({group: 1, x: line[0], y: line[1]}); 
				dataset.add({group: 2, x: line[0], y: line[3]}); 
			}); 
		}); 
	}); 
}); 
