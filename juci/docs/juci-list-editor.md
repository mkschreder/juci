JUCI LIST EDITOR
================

This is a generic control that handles a list of objects and allows you to
select, edit and delete the items in the list. This control is very useful for
creating dynamic editable lists for up to 10-20 items. It is designed to be
responsive so that it works just as well on a mobile device as in web browser.
In JUCI this control is used for editing lists of uci objects - such as wifi
interfaces, network interfaces etc. 

PARAMETERS
==========

* `ng-items` - an `Array` of items that will be edited. 

* `item-editor` - the name of the directive that will be used for editing an item (without the < and >). Directive must accept ng-model parameter that will be set to the currently edited item. 

* `get-item-title` - a function or expression that retreives the title of an item to be shown in the gui. $item variable can be used to refer to the actual item.  

* `on-create` - a function to be called when user presses Add button. 

* `on-delete` - a function to be called when user deletes and item. 

TRANSLATION
===========

The `get-item-title` function should return an already translated string. 

EXAMPLE
=======

	<juci-item-editor ng-items="item_array"
		item-editor="item-edit-directive"
		get-item-title="$item.title"
		on-create="onCreateItem()"
		on-delete="onDeleteItem($item)" />
	

