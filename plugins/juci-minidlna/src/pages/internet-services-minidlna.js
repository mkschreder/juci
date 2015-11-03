//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("MiniDLNAConfigPage", function($scope, $minidlna, $tr, gettext, $rpc, $juciDialog){
	$scope.data = [{label:"loading"}];
	$minidlna.getConfig().done(function(config){
		$scope.config = config; 
		$scope.tagslistData = $scope.config.media_dir.value.filter(function(dir){
			return (dir.substring(0, 4) == "/mnt");
		}).map(function(dir){
			return {
				text: "/" + dir.substring(4),
				path: dir
			}
		
		});
		$scope.$apply();
		$scope.onAddFolder = function(){
			var model = {}
			$juciDialog.show("minidlna-file-tree", {
				title: $tr(gettext("Add folder to share")),
				model: model,
				on_apply: function(btn, dlg){
					if(!model.selected || !model.selected.path)return false;
					for(var i=0; i < $scope.tagslistData.length; i++){
						if($scope.tagslistData[i].path == model.selected.path) return false;
					}
					$scope.tagslistData.push({
						path: model.selected.path,
						text: model.selected.path.substring(4)
					});
					$scope.updateConfig();
					return true;
				}	
			});
		};
		$scope.onTagAdded = function(tag){
			$scope.tagslistData = $scope.tagslistData.map(function(k){
				if(k.text == tag.text){
					k.path = "/mnt"+k.text;
				}
				return k;
			});
			$scope.updateConfig();
		};
		$scope.updateConfig =  function(){
			$scope.config.media_dir.value = $scope.tagslistData.map(function(dir){
				return dir.path;
			});
		};
		var tag_promise = null;
		$scope.loadTags = function(text){
			if(!tag_promise) tag_promise = new Promise(function(resolve, reject){
				$rpc.juci.minidlna.autocomplete({path:text}).done(function(data){
					tag_promise = null;
					if(data.folders) resolve(data.folders);
					else reject(data);
				})
			});
			return tag_promise;
		};
	}); 
}); 
