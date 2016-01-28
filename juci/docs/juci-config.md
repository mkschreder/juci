JUCI Config Tools
=================

This module consists of several widgets that are typically used for designing
configuration pages. 

The list includes: 

* `juci-config-section` - a section in the config (typically with a separating line underneath) 
* `juci-config-heading` - a heading inside the config
* `juci-config-info` - an information paragraph. Typically underneath a heading
* `juci-config-lines` - for creating a group of lines (like table or enclosing div) 
* `juci-config-line` - for structuring title | control pairs 
	- `title` - string to display as the heading of the line
	- `help` - paragraph that describes what this setting does
	- `error` - variable that points to error text updated by the validator of the field. 
* `juci-config-apply` - apply and cancel buttons at the bottom of the page. 
	- calls $uci.$save()
	- will save all uncommited changes.
	- cancel currently reloads the page and thus also reverts all uci changes
	- room for improvement

These are basic building blocks that you will use to create a configuration
page. 

You do not have to use any of these building blocks to build your pages of
course - they are however a very good way to make all pages look consistent and
make it easy to restyle not just the CSS, but also the html of all pages at the
same time. 

Example 
=======

	<juci-config-section>
		<juci-config-heading translate>My Section</juci-config-heading>
		<juci-config-info translate>some.key.id.for.info</juci-config-info>
		<juci-config-lines>
			<juci-config-line title="{{'Config Option'|translate}}" 
				help="{{'help text..'|translate}}" 
				error="uci.field.$error">
				.. control here .. 
			</juci-config-line>
		</juci-config-lines>
	</juci-config-section>

