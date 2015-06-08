angular.module("juci").config(function($provide){
	var overrides = {
		"juciFooterDirective": "/widgets/juci.footer.html", 
		"juciLayoutNakedDirective": "/widgets/juci.layout.naked.html", 
		"juciLayoutSingleColumnDirective": "/widgets/juci.layout.single_column.html", 
		"juciLayoutWithSidebarDirective": "/widgets/juci.layout.with_sidebar.html", 
		"juciNavbarDirective": "/widgets/juci.navbar.html",
		"juciTopBarDirective": "/widgets/juci.top_bar.html"
	}; 
	var plugin_root = ""; //"/themes/vodafone/"; 
	Object.keys(overrides).map(function(k){
		$provide.decorator(k, function($delegate){
			console.log("VF DECORATOR: "+JSON.stringify($delegate)); 
			if($delegate.length > 1) 
				$delegate[1].templateUrl = plugin_root + overrides[k]; 
			return $delegate; 
		}); 
	}); 
}); 
