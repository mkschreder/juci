# JUCI file system structure

To make development more straightforward and in order to faciliate easy
searching and editing of files, juci follows a certain set of rules with
regards to file names. 

* all pages must have the same filename as the URL hasbang identifying the
page. 
	
	WHY: so that you can look at url ex. #!internet-dns and know that this page
is in file internet-dns.[html|js] (or old style internet.dns.[html|js]).

* all page files must be globally unique across all plugins. 

	WHY: so that you can easily override pages from other plugins. Even if the
files did not have unique names, you would still need to have unique
controllers and directives across ALL plugins that are in use. Therefore this
does not in any way limit you. It is a good thing that allows you to for
instance override default page or widget in a juci theme. 

* all widget files must be globally unique for all widgets across all plugins.

	WHY: same as for pages. You can't have two html tags with same name in angular
anyway. You can still override files though.

* all widget filenames should have a name that reflects the name of the
directive and the controller for the widget. Keep in mind that angular
directive name is in "camelCase" while the resulting html tag is in
"camel-case" with a dash in between where a capital letter is placed in the
directive. 

	WHY: because it makes it very easy to navigate a tree of files and right
away go to the file where the widget is implemented. In vim this is a matter of
simply using text search function inside a NERDTree window - but even in geany
TreeViewer it is easy to visually find the file that contains html widget code.
And since names are globally unique, you will only have a file with that name
in a single place. When you then change names of your directive/controller, it
is a good idea to also change the name of the file. 

* all lua script objects should have the same filename as the object on ubus.

	Well actually, ubus-scriptd will take care of that. 

