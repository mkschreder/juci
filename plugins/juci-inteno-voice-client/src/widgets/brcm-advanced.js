//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("juciBrcmAdvanced", function(){
	return {
		scope: true,
		templateUrl: "widgets/brcm-advanced.html",
		replace: true,
		controller: "brcmAdvancedCtrl"
	};
}).controller("brcmAdvancedCtrl", function($scope, $uci, $tr, gettext, $network, $rpc){
	$uci.$sync(["voice_client"]).done(function(){
		$scope.brcm = $uci.voice_client.BRCM;
	});
	$scope.languages = [
		{ label: $tr(gettext("Australia")),				value: "AUS" },
		{ label: $tr(gettext("Belgium")),				value: "BEL" },
		{ label: $tr(gettext("Brazil")),				value: "BRA" },
		{ label: $tr(gettext("Chile")),					value: "CHL" },
		{ label: $tr(gettext("China")),					value: "CHN" },
		{ label: $tr(gettext("Czech")),					value: "CZE" },
		{ label: $tr(gettext("Denmark")),				value: "DNK" },
		{ label: $tr(gettext("Etsi")),					value: "ETS" },
		{ label: $tr(gettext("Finland")),				value: "FIN" },
		{ label: $tr(gettext("France")),				value: "FRA" },
		{ label: $tr(gettext("Germany")),				value: "DEU" },
		{ label: $tr(gettext("Hungary")),				value: "HUN" },
		{ label: $tr(gettext("India")),					value: "IND" },
		{ label: $tr(gettext("Italy")),					value: "ITA" },
		{ label: $tr(gettext("Japan")),					value: "JPN" },
		{ label: $tr(gettext("Netherlands")),			value: "NLD" },
		{ label: $tr(gettext("New Zealand")),			value: "NZL" },
		{ label: $tr(gettext("North America")),			value: "USA" },
		{ label: $tr(gettext("Spain")),					value: "ESP" },
		{ label: $tr(gettext("Sweden")),				value: "SWE" },
		{ label: $tr(gettext("Switzerland")),			value: "CHE" },
		{ label: $tr(gettext("Norway")),				value: "NOR" },
		{ label: $tr(gettext("Taiwan")),				value: "TWN" },
		{ label: $tr(gettext("United Kingdoms")),		value: "GRB" },
		{ label: $tr(gettext("United Arab Emirates")),	value: "ARE" },
		{ label: $tr(gettext("CFG TR57")),				value: "T57" }
	];
	$scope.change_language = function(){
		if(confirm("Do you want to restart now?")){
			$uci.$save().done($rpc.juci.system.reboot());
		}
	};
});
