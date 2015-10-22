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
					console.log(JSON.stringify(model.selected))
					return true;
				}	
			});
		};
	}); 
}); 
