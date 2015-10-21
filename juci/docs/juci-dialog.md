JUCI POPUP DIALOG
=================

A widget for showing a configuration page / widget inside a popup modal dialog. 

USAGE
=====

* `$juciDialog` - a factory for use in controller. 
	- show(params) - async method that pops up the dialog. <params> is an object with configuration parameters. 

SHOWING DIALOG BOX
==================

* `show(widget:string, params:object)`
	
	Widget: 
	- string name of the directive that will be dynamically created in the modal. This directive can accept ngModel which will be set to the model supplied in the options. 
	
	Params: 
	- `model` - object that represents the model that will be passed to the widget inside the dialog box. 
	- `buttons` - object with fields <label>, <value> and <primary>
	- `on_button(button, modalInstance)` - callback that gets called on button being clicked (default: close on cancel, call on\_apply on accept) 
	- `on_apply(button, modalInstance)` - gets called as default action for apply button (only called if you don't override on\_button) 
	
	Returns: promise
	- default: resolve when on\_apply returns true, reject if closed or cancel is pressed. 

USAGE
=====

	$juciDialog.show("uci-wireless-interface", {
		title: $tr(gettext("Edit wireless interface")),  
		on_apply: function(btn, dlg){
			// here we have opportunity to validate the data and not close dialog if data is invalid (by returning false)
			$uci.$save(); 
			return true; 
		}, 
		model: iface.uci_dev
	}).done(function(){
		// we get here when dialog is closed (and has been accepted)	
	}).fail(function(){
		// called when dialog is canceled or closed
	}); 
