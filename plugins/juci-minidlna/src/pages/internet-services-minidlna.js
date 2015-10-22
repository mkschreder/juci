//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("MiniDLNAConfigPage", function($scope, $minidlna, $tr, gettext, $rpc, $juciDialog){
	$scope.data = [{label:"loading"}];
	$minidlna.getConfig().done(function(config){
		$scope.config = config; 
		$scope.$apply();
		$scope.onAddFolder = function(){
			var model = {}
			$juciDialog.show("minidlna-file-tree", {
				title: $tr(gettext("Add folder to share")),
				model: model,
				on_apply: function(btn, dlg){
					if(!model.selected || !model.selected.path)return false;
					$scope.config.media_dir.value.push(model.selected.path);
					console.log(JSON.stringify($scope.config.media_dir.value));
					return true;
				}	
			});
		};
		$scope.onDeleteFolder = function(item){
			var index = $scope.config.media_dir.value.indexOf(item);
			if(index > -1){
				$scope.config.media_dir.value.splice(index, 1);
			}
		};
	}); 
}); 
