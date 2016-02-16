#!/usr/bin/lua

local juci = require("juci.core"); 
local json = require("juci.json"); 

function ddns_list_providers()
	local list = juci.shell("cat /usr/lib/ddns/services | awk '/\".*\"/{ gsub(\"\\\"\",\"\",$1); print($1);}'"); 
	local line; 
	local result = { providers = {} }; 
	for line in list:gmatch("%S+") do
		table.insert(result.providers, line); 
	end
	print(json.encode(result)); 
end

return {
	providers = ddns_list_providers
}; 
