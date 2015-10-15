JUCI SELECT
===========

JUCI select is a generic dropdown implementation for juci. It takes a list of
display elements as <ng-items> argument which consist of a label and a value.
It also takes an <ng-model> argument that determines the currently selected
element value. 

The control will automatically select the element in the list that corresponds
to the initial value of the model and also update the selection when model
value changes. 

PARAMETERS
==========

* `ng-items` - an `Array` of items that represents items that are available for 
selection in the list. Each item in this array should have a `label` and
`value` field. The `label` field will represent human readable text in the
dropdown and the `value` will represent the value that will be assigned to the
model when user selects that particular item.  

* `ng-model` - the model value who's value will correspond to the `value` field
of one of the items. 

TRANSLATION
===========

The control itself does not do any translation in place. Instead you need to translate your labels yourself using $tr() and gettext() methods. 

EXAMPLE
=======

	<juci-select ng-items="items" ng-model="model"/>

	$scope.items = [
		{ label: $tr(gettext("Label Text")), value: { .. value object .. } }, 
		{ label: $tr(gettext("Label #2")), value: 2
	]; 
	$scope.model = 2; 

The above example will create a dropdwon list which initially will show "Label #2" as selected item. 
