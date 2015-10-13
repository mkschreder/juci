CREATING PAGES AND WIDGETS
==============

A JUCI based interface is typically built from a number of pages that are accessible through a navigation menu and where each page can consist of unlimited number of widgets that build up the page. Thus pages are relatively static components that you refer to from your theme's menu.json file, while widgets are reusable components that can appear in any number of pages. Widgets are typically refered (or included) into a page by means of using the directive(1) of a widget. In JUCI all widgets should have the same filename as the name of the directive that they implement. 

CREATING A PAGE
===============

Create two files in plugins/your_plugin/src/pages/ directory and give them a descriptive (and globally unique name): 

	|--pages/
	|----yourplugin-page-main.js
	|----yourplugin-page-main.html

Now you will create an angular controller and a template for your page. Pages typically directly refer to their controller in the page html using ng-controller tag. This is mainly an artifact from when this system was created. 

yourplugin-page-main.js: 

	JUCI.app.controller("yourpluginPageMain", function($scope, $rpc, $uci){
		$rpc.juci.system.info().done(function(info){
			$scope.text = JSON.stringify(info); 
			$scope.$apply(); 
		}); 
	}); 

yourplugin-page-main.html: 
	
	<juci-layout-single-column>
		<div ng-controller="yourpluginPageMain">
			<pre>{{text}}</pre>
		</div>
	</juci-layout-single-column>

Here we create a page with single column layout (in reality layout-single-column is in fact a juci widget that you can use to setup this kind of layout) and then we add code to make a ubus call to rpc function located in /usr/lib/ubus/juci/system. The result is placed inside a scope variable called *text* and then the view is updated using $scope.$apply(); Note that you only need to do $scope.$apply() here because this is an asynchronous method call. In the main controller function you do not need to call apply() in order to make changes visible - but when result is only available at some later point in time after your code has already exited your controller function then you do need to call $apply() manually. 

If you now build juci (after adding CONFIG_PACKAGE_yourplugin=y to Makefile.local) and go to page http://juci/#!/yourplugin-page-main then you should be able to see a JSON representation of the result from the ubus call to get system info. 
