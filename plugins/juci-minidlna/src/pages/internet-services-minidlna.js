//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("MiniDLNAConfigPage", function($network, $scope, $minidlna, $tr, gettext, $rpc, $juciDialog){
	$scope.data = [{label:"loading"}];
	$scope.network = {
		all : [],
		selected : []
	};
	$scope.album_art = []
	$minidlna.getConfig().done(function(config){
		$scope.config = config; 
		$scope.album_art = $scope.config.album_art_names.value.split("/");
		$scope.tagslistData = $scope.config.media_dir.value.filter(function(dir){
			return (dir.substring(0, 4) == "/mnt");
		}).map(function(dir){
			return {
				text: "/" + dir.substring(4),
				path: dir
			}
		
		});
		$network.getNetworks().done(function(data){
			$scope.network.all = data.map(function(x){
				return {
					name:x[".name"],
					selected: ($scope.config.network.value.split(",").indexOf(x[".name"]) > -1)
				}
			});
			$scope.$apply();
		});
	});
	$scope.onChangeAAName = function(tag){
		var index = null;
		if((index = $scope.album_art.indexOf(tag.text)) > -1){
			$scope.album_art.splice(index,1);
		}else{
			$scope.album_art.push(tag.text);
		}
		$scope.config.album_art_names.value = $scope.album_art.join("/");
	};
	$scope.$watch("network.selected", function(){
		if(!$scope.config)return;
		$scope.config.network.value = $scope.network.selected.map(function(x){
			return x.name;
		}).join();
	}, true);
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
	$scope.onPortChange = function(){
		if(isNaN($scope.config.port.value)){
			window.alert("port must be a number");
			while(isNaN($scope.config.port.value)){
				$scope.config.port.value = $scope.config.port.value.slice(0,-1);
			}
		}
	};
}); 
