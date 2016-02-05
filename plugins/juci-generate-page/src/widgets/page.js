//! Author: Reidar Cederrqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("testWidget", function(){
	return {
		templateUrl: "/widgets/page.html",
		scope: {
			model: "=ngModel"
		},
		replace: true,
		require: "^model",
		controller: "testWidgetCtrl"
	};
})
.controller("testWidgetCtrl", function($scope, $uci){
	$scope.$watch("model", function onTestWidgetModelChanged(){
		if(!$scope.model) return;
		$uci.$sync($scope.model.configs).done(function(){
			$scope.model.configs.map(function(config){
				$scope[config] = $uci[config];
			});
			$scope.model.sections.map(function(sec){
				sec.lines.map(function(line){
					switch(line.type){
						case "Boolean":
							line._widget = "<switch class='green' ng-model='" + line.model + "' />";
							break;
						case "String":
							line._widget = "<input type='text' class='form-control' ng-model='" + line.model + "' />";
							break;
						case "Number":
							line._widget = "<input type='number' class='form-control' ng-model='" + line.model + "' />";
							break;
						default:
					}
				});
			});
		});
	}, false);
});
