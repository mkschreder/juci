JUCI SWITCH
===========

The `juci-switch` control basically shows a toggle switch in the browser that
can be toggled by the user. It's `ng-model` parameter should point to a boolean
value that will be updated when user toggles the switch. 

PARAMETERS
==========

* `ng-model` - boolean value that will be updated when switch is toggled. 

* `class` - usually set to "green" and specifies css class for the switch. 

EXAMPLE
=======

	<switch ng-model="data.model" class="green"/>

	$scope.data = { model: false }; 

NOTE
====

Currently the switch control does not work correctly when the boolean value is
placed directly in scope. For this reason it needs to receive an object field
as model which in the example above is data.model. This will work, while
placing the boolean value directly as a member of scope and using just "model"
as model will result in value not being updated correctly. 

