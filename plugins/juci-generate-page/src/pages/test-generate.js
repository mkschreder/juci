//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app.controller("testGenerateCtrl", function($scope){
	$scope.model =  {
		configs: ["minidlna","network"],
		sections: [
			{ title:"testSection", lines: [
				{ title: "fist Test line", type: "Boolean", model: "minidlna.config.enabled.value"},
				{ title: "second line", type: "String", model: "minidlna.config.port.value"},
				{ title: "third line", type: "String", model: "minidlna.config.serial.value"}]
			},
			{ title:"Second Section", lines: []}
		]
	};
});
