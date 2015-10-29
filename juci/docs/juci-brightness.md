JUCI LED Brightness Control
===========================

`juci-brightness` is a bar selector with two buttons and a 5 step intensity scale. It is mainly to be used for controlling led brightness. 

Parameters
==========

* `ng-model` - the model where to put the resulting value
* `min` - minimum value (default: 0)
* `max` - maximum value (default: 100)

The difference between min and max is divided by the number of bars and becomes the increment/decrement step value.  

Example
=======

	<juci-brightness ng-model="config.leds.status.brightness.value" min="0" max="0"/>
