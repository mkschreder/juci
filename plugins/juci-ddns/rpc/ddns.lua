#!/usr/bin/lua

-- JUCI Lua Backend Server API
-- Copyright (c) 2016 Martin Schröder <mkschreder.uk@gmail.com>. All rights reserved. 
-- This module is distributed under JUCI Genereal Public License as published
-- at https://github.com/mkschreder/jucid/COPYING. See COPYING file for details. 

local juci = require("orange/core"); 
local json = require("orange/json"); 

function ddns_list_providers()
	local list = juci.shell("cat /usr/lib/ddns/services | awk '/\".*\"/{ gsub(\"\\\"\",\"\",$1); print($1);}'"); 
	local line; 
	local result = { providers = {} }; 
	for line in list:gmatch("%S+") do
		table.insert(result.providers, line); 
	end
	return result;
end

return {
	providers = ddns_list_providers
}; 
