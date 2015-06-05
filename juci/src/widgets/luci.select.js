$juci.module("core")
.directive('luciSelect', function ($compile) {
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
						/*if(scope.selectedItem != undefined && scope.selectedItem.value == x.value)
							scope.selectedText = scope.selectedItem.label || scope.placeholder;
						else if(scope.selectedItem == x.value){
							scope.selectedText = x.label || scope.placeholder; 
						}*/
						//console.log(JSON.stringify(x)+" "+JSON.stringify(scope.selectedItem));
						return { label: x.label, value: x.value }; 
					} else {
						/*if(scope.selectedItem == x){
							scope.selectedText = scope.selectedItem || scope.placeholder; 
						}*/
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
});
