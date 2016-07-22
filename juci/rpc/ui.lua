#!/usr/bin/lua

local ubus = require("orange/ubus"); 
local json = require("orange/json"); 

local function juci_menu()
	local menu = {}; 
	local data = ubus.call("uci", "get", { config = "juci", type = "menu" }); 
	for _,s in pairs(data.values) do
		if(SESSION.access("menu", s.path or "-", s.page or "-", "r") and 
			not SESSION.access("-menu", s.path or "-", s.page or "-", "r")) then 
			menu[s[".name"]] = s; 
		else 
			print("access to menu "..s.path.." denied!"); 
		end
	end
	return menu;
end

return {
	menu = juci_menu
}; 
