#!/usr/bin/lua

-- JUCI Lua Backend Server API
-- Copyright (c) 2016 Martin Schröder <mkschreder.uk@gmail.com>. All rights reserved. 
-- This module is distributed under GNU GPLv3 with additional permission for signed images.
-- See LICENSE file for more details. 

local juci = require("orange/core"); 
local json = require("orange/json"); 

local function bwc_get_graph(opts)
	if(not opts.ethdevice) then return { error = "No device specified" }; end
	local graph = juci.shell("juci-bwc -i %s 2>/dev/null", opts.ethdevice); 
	return { graph = json.decode("["..graph.."]") }; 
end

return {
	["get"] = bwc_get_graph
}; 
