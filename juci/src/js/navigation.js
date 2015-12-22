/*	
	This file is part of JUCI (https://github.com/mkschreder/juci.git)

	Copyright (c) 2015 Martin K. Schröder <mkschreder.uk@gmail.com>

	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
*/ 

// provides a service for managing all pages
// pages register with this service, and menus can query it to get the navigation tree

(function($juci){
	function JUCINavigation(){
		var data = {
			children: {},
			children_list: []
		}; 
		var self = this; 
		this.tree = function(path){
			if(!path)
				return data; 
			return this.findLeaf(path); 
		};
		this.findLeaf = function(path){
			//console.log("FIND LEAF: "+path); 
			var parts = path.split("/"); 
			var obj = data; 
			// find the right leaf node
			while(parts.length){
				if(obj.children.hasOwnProperty(parts[0])){
					obj = obj.children[parts.shift()]; 
				} else {
					return null; 
				}
			} 
			return obj; 
		};
		this.findNodeByPath = function(path){
			return this.findLeaf(path); 
		}; 
		this.findNodeByHref = function(href, node){
			var list = []; 
			function flatten(tree){
				list.push(tree); 
				tree.children_list.map(function(ch){ 
					if(!ch.href) return; 
					if(ch._visited) alert("ERROR: loops in menu structure are not allowed! node "+ch.href+" already visited!"); 
					ch._visited = true; 
					flatten(ch); 
				}); 
			}
			flatten(node || data); 
			list.map(function(ch){ ch._visited = false; }); // reset the flag for next time 
			return list.find(function(ch){ return ch.href == href; }); 
		}
		this.insertLeaf = function(path, item){
			//console.log("INSERT LEAF: "+path); 
			var parts = item.path.split("/"); 
			var obj = data; 
			// find the right leaf node
			while(parts.length > 1){
				if(obj.children.hasOwnProperty(parts[0])){
					obj = obj.children[parts.shift()]; 
				} else {
					// do not add items whos parents do not exist!
					// we can thus hide full hierarchy by simply hiding an item
					return ;
					/*var item = {
						title: "(none)",
						children: {},
						children_list: []
					};
					obj.children[parts[0]] = item; 
					//obj.children_list.push(item); 
					obj = obj.children[parts.shift()]; 
					*/
				}
			} 
			// make sure that inserted item has empty child lists
			if(!item.children) {
				item.children = {}; 
				item.children_list = []; 
			}
			if(!obj.children.hasOwnProperty(parts[0])){
				obj.children[parts[0]] = item; 
				obj.children_list.push(item); 
			} else {
				var o = obj.children[parts[0]]; 
				item.children = o.children; 
				item.children_list = o.children_list; 
				obj.children[parts[0]] = item; 
				item = o; 
			}
			obj.children_list = Object.keys(obj.children).map(function (key) {
				return obj.children[key]; 
			});
			//obj.children_list.sort(function(a, b){
			//	return a.index - b.index; 
			//}); 
			return item; 
		};
		this.register = function(item){
			if(!item.path) return; 
			item = this.insertLeaf(item.path, item); 
			
			return data; 
		}; 
	}
	JUCI.navigation = new JUCINavigation(); 
	
	JUCI.app.factory('$navigation', function navigationProvider(){
		return JUCI.navigation; 
	}); 
})(JUCI); 
