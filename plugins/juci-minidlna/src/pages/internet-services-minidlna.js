//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("MiniDLNAConfigPage", function($network, $scope, $minidlna, $tr, gettext, $rpc, $juciDialog){
	$scope.data = [{label:"loading"}];
	$scope.network = {
		all : [],
		selected : []
	};
	$scope.port = {};
	$scope.album_art = []
	$minidlna.getConfig().done(function(config){
		$scope.config = config; 
		$scope.port.value = Number($scope.config.port.value);
		$scope.album_art = $scope.config.album_art_names.value.split("/");
		$scope.tagslistData = $scope.config.media_dir.value.filter(function(dir){
			var pre = dir.substr(0, 2);
			var dirr;
			if(pre == "A," || pre == "V," || pre == "P,"){
				dirr = dir.substr(2);
			}else{
				dirr = dir;
			}
			return (dirr.substring(0, 4) == "/mnt");
		}).map(function(dir){
			if(dir == "/mnt/"){
				return {
					text: "/",
					path: dir
				}
			}else if(dir.substr(2) == "/mnt/"){
				return {
					text: dir.substr(0, 2) + "/",
					path: dir
				}
			}
			if(dir.substr(1, 1) == ","){
				return {
					text: "/" + dir.substr(0,2) + dir.substring(4),
					path: dir
				}
			}
			return {
				text: "/" + dir.substr(4),
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

	$rpc.juci.minidlna.status().done(function(data){
		$scope.count = data.count;
		$scope.$apply();
	});
	
	$rpc.juci.system.service.status({name:"minidlna"}).done(function(result){
		$scope.is_running = result.running ? "active" : "inactive";
		$scope.$apply();
	});

	$scope.root_dir = [
		{ label: $tr(gettext("Standard Container")),	value: "." },
		{ label: $tr(gettext("Browse directory")), 		value: "B" },
		{ label: $tr(gettext("Music")),					value: "M" },
		{ label: $tr(gettext("Video")),					value: "V" },
		{ label: $tr(gettext("Pictures")),				value: "P" }
	];
	$scope.$watch('port', function(){
		if(!$scope.port.value)return;
		$scope.config.port.value = $scope.port.value;
	}, true);
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
					var prefix = $scope.tagslistData[i].path.substr(0,2);
					if(prefix  == "V," || prefix == "A," || prefix == "P,")
						if($scope.tagslistData[i].path.substr(2) == model.selected.path) return false;
					if($scope.tagslistData[i].path == model.selected.path) return false;
				}
				if(model.selected_dirtype != ""){
					$scope.tagslistData.push({
						path: model.selected_dirtype + "," + model.selected.path,
						text: model.selected_dirtype + "," + model.selected.path.substr(4)
					});
				}else{
					$scope.tagslistData.push({
						path: model.selected.path,
						text: model.selected.path.substr(4)
					});
				}
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
