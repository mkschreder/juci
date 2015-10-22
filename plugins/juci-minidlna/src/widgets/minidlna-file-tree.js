//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("minidlnaFileTree", function(){
	return {
		templateUrl: "/widgets/minidlna-file-tree.html",
		scope: {
			model: "=ngModel"	
		},
		require: "^ngModel",
		controller: "minidlnaFileTreeController"
	};
}).controller("minidlnaFileTreeController", function($scope, $rpc){
	$scope.data = {
			tree: [{
			label: "Loading.."
		}], 
		dirtypes: [ 
			{label:"All types", value:"-"}, 
			{label:"Video only", value:"V"},
			{label:"Audio only", value:"A"},
			{label:"Pictures only", value:"P"}
		]
	}; 
	$scope.model.selected_dirtype = $scope.data.dirtypes[0].value;
	$rpc.juci.minidlna.folders().done(function(data){
		function to_tree_format(obj){
			return Object.keys(obj).map(function(folder){
				if(obj[folder]["children"]){
					var tmp = {
						label: "/"+folder+"/"
					}
					if(typeof obj[folder]["children"] == "object"){
						tmp.children = to_tree_format(obj[folder]["children"]);
					}
					return tmp;
				}
			});
		}
		//console.log(to_tree_format(data));
		$scope.data.tree = to_tree_format(data); 
		$scope.model.selected = $scope.data.tree[0].children[0];
		$scope.$apply();
	});
});
