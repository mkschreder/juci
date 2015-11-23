//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("juciMultiSelect", function($compile){
	return {
		templateUrl: "/widgets/juci-multi-select.html", 
		controller: "juciMultiSelect", 
		scope: {
			model: "=ngModel",
			items: "=ngItems",
			getItemTitle: "&itemLabel" 
		}, 
		replace: true
	 };  
})
.controller("juciMultiSelect", function($scope, $config, $state, $localStorage, $tr, gettext){
	$scope.data = { 
		input: [], 
		output: []
	};
		
	function update(){
		if(!$scope.items || !$scope.model || !($scope.items instanceof Array) || !($scope.model instanceof Array)) return; 
		$scope.data.input = $scope.items.map(function(i){
			return {
				label: $scope.getItemTitle({ "$item": i }),
				model: i, 
				selected: false
			}; 
		}); 
		$scope.model.forEach(function(x){
			var item = {
				label: $scope.getItemTitle({ "$item": x }),
				model: x, 
				selected: true
			}; 
			//console.log($scope.getItemTitle({ "$item": x })); 
			//$scope.data.input.push(item); 
			$scope.data.input.push(item); 
		}); 
	}
	
	$scope.onItemClick = function(item){
		if(!$scope.items || !$scope.model || !($scope.items instanceof Array) || !($scope.model instanceof Array)) return; 
		if(item.selected) $scope.model.push(item.model);
		else {
			$scope.model.splice($scope.model.indexOf(item.model), 1); 
		}
	}

	$scope.$watch("model", function(model){
		update();
	}); 

	$scope.$watch("items", function(items){
		update();
	});
}); 
