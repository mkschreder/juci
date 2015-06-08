JUCI.app
.directive("juciSelect", function($parse){
	return {
		restrict: 'E', 
		scope: {
			ngModel: "@", 
			ngItems: "=", 
			onChange: "&", 
			placeholder: "@"
		}, 
		require: ["ngModel", "?placeholder"], 
		template: '<div class="btn-group" style="white-space: nowrap;">'+
			'<button class="btn btn-default dropdown-toggle button-label {{size_class}}" style="background-color: #fff !important; border-bottom-right-radius: 0px; border-top-right-radius: 0px; display: inline-block; float:none; " data-toggle="dropdown">{{(selectedText || placeholder) | translate}}</button>'+
			'<button class="btn btn-default dropdown-toggle" style="background-color: #fff !important; z-index: 100; display: inline-block; float:none;" data-toggle="dropdown"><span class="caret"></span></button>'+
			'<ul class="dropdown-menu"><li ng-repeat="item in ngItems"><a tabindex="-1" ng-click="select(item)" href="">{{item.label}}</a></li></ul>'+
			'</div>', 
		link: function($scope, elem, attrs) {
			$scope.select = function(item){
				$scope.selectedText = item.label; 
				var model = $parse(attrs.ngModel); 
				model.assign($scope.$parent, item.value); 
				//console.log("Model ["+"$parent."+attrs.ngModel+"]: "+model($scope.$parent)); 
				$scope.onChange({$item: item, $value: item.value}); 
			}
			function updateSelected(items){
				if(!items || !(items instanceof Array)) return; 
				var model = $parse(attrs.ngModel); 
				var selected = items.find(function(i){
					console.log("Check if ["+"$parent."+$scope.ngModel+"]: "+model($scope.$parent)+" == "+ i.value); 
					return angular.equals(model($scope.$parent), i.value) || (model($scope.$parent) == i.value); 
				}); 
				if(selected) $scope.selectedText = selected.label;  
				else $scope.selectedText = $scope.placeholder; 
			}
			$scope.$watch("ngItems", function(items){
				if(!items || !(items instanceof Array)) return; 
				//console.log("set items: "+items); 
				updateSelected(items); 
			}); 
			$scope.$parent.$watch(attrs.ngModel, function(value){
				console.log("Select parent updated: "+value); 
				updateSelected($scope.ngItems); 
			}); 
		}
	}; 
}); 

/*$juci.module("core")
.directive('juciSelect', function ($compile) {
	return {
	restrict: 'E',
	scope: {
		selectedItem: '=ngModel', 
		items: '=ngItems',
		onChange: '&onChange',
		placeholder: '@placeholder',
		prefix: "@", 
		size: '=size'
	},
	require: ["ngModel"], 
	link: function (scope, element, attrs, ngModel) {
		var html = '';
	
		switch (attrs.type) {
			case "dropdown":
				html += '<div class="dropdown dropdown-toggle" data-toggle="dropdown" ><a class="dropdown-toggle" role="button" data-toggle="dropdown"  href="javascript:;">{{((selectedItem||{}).label || placeholder) | translate}}<b class="caret"></b></a>';
				break;
			default:
				html += '<div class="btn-group" style="white-space: nowrap;"><button class="btn btn-default button-label {{size_class}}" style="display: inline-block; float:none; ">{{selectedText | translate}}</button><button class="btn btn-default dropdown-toggle" style="display: inline-block; float:none;" data-toggle="dropdown"><span class="caret"></span></button>';
				break;
		}
		html += '<ul class="dropdown-menu"><li ng-repeat="item in itemList"><a tabindex="-1" data-ng-click="selectVal(item)" href="">{{item.label}}</a></li></ul></div>';
		element.append($compile(html)(scope));
		
		if(scope.size) 
			scope.size_class = "btn-"+scope.size; 
			
		scope.$watch("size", function(){
			scope.size_class = "btn-"+scope.size; 
		}); 
		scope.selectedText = scope.placeholder; 
		
		scope.$watch("items", function(value){
			if(value){
				scope.itemList = value.map(function(x){
					//console.log(JSON.stringify(x)+" "+JSON.stringify(scope.selectedItem));
					if(typeof x == "object" && "value" in x){
						
						//console.log(JSON.stringify(x)+" "+JSON.stringify(scope.selectedItem));
						return { label: x.label, value: x.value }; 
					} else {
						return { label: x, value: x }; 
					}
				}); 
			}
		}); 
		scope.$watch("selectedItem", function(value){
			//console.log("Selected item: "+JSON.stringify(value));
			if(value != undefined && (typeof value) == "object") {
				if("value" in value) scope.selectedText = value.label; 
				else scope.selectedText = scope.placeholder; 
			}
			else if(value != undefined && scope.itemList != undefined) { 
				scope.itemList.map(function(x){
					if(x.value == value) scope.selectedText = x.label;
				}); 
			} 
			//else scope.selectedText = value || scope.placeholder; 
		}); 
		
		scope.selectVal = function (item) {
			if(!item) return; 
			switch (attrs.type) {
				case "dropdown":
					$('a.dropdown-toggle', element).html('<b class="caret"></b> ' + item.label);
					break;
				default:
					$('button.button-label', element).html(item.label);
					break;
			}
			//console.log("DROPDOWN: "+JSON.stringify(scope.selectedItem)+", "+item.value);
			var value = item; 
			if("value" in item) 
				value = item.value; 
			if(value instanceof Array) { // make it work for lists without changing reference
				if(!(scope.selectedItem instanceof Array)) scope.selectedItem = []; 
				scope.selectedItem.splice(0, scope.selectedItem.length); 
				value.map(function(x){ scope.selectedItem.push(x); }); 
			} else if(value instanceof Object){ // make it work for objects without changing reference
				Object.assign(scope.selectedItem, value);
			} else {
				scope.selectedItem = value; // make it work for primitive types
			}
			//ngModel.$setViewValue(scope.selectedItem); 
			//attrs.$set("ngModel", value); 
			setTimeout(function(){ // defer the call till after $digest is finished
				scope.onChange();
			}, 0); 
		};
		//scope.selectVal(scope.selectedItem);
	}
	};
});*/
