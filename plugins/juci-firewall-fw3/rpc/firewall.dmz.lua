#!/usr/bin/lua

-- JUCI Lua Backend Server API
-- Copyright (c) 2016 Martin Schröder <mkschreder.uk@gmail.com>. All rights reserved. 
-- This module is distributed under GNU GPLv3 with additional permission for signed images.
-- See LICENSE file for more details. 

local juci = require("orange/core");
local json = require("orange/json");

local function excluded_ports() 
	-- Excluded ports is read from a tmp file that is not created by default. This is a patch feature added to dmz firewall script. Please update your script if you want to use it. 
	local result = juci.readfile("/tmp/dmz_excluded_ports");
	return {result = (result or "")};
end

return {
	["excluded_ports"] = excluded_ports
};

