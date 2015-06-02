angular.module("luci").config(function($provide){
	var overrides = {
		"luciFooterDirective": "/widgets/luci.footer.html", 
		"luciLayoutNakedDirective": "/widgets/luci.layout.naked.html", 
		"luciLayoutSingleColumnDirective": "/widgets/luci.layout.single_column.html", 
		"luciLayoutWithSidebarDirective": "/widgets/luci.layout.with_sidebar.html", 
		"luciNavbarDirective": "/widgets/luci.navbar.html",
		"luciTopBarDirective": "/widgets/luci.top_bar.html"
	}; 
	var plugin_root = "/themes/vodafone/"; 
	Object.keys(overrides).map(function(k){
		$provide.decorator(k, function($delegate){
			//console.log("VF DECORATOR: "+JSON.stringify($delegate)); 
			if($delegate.length > 1) 
				$delegate[1].templateUrl = plugin_root + overrides[k]; 
			return $delegate; 
		}); 
	}); 
}); 
