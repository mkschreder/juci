#!/usr/bin/lua

local juci = require("juci.core");
local json = require("juci.json");

local function excluded_ports() 
	-- Excluded ports is read from a tmp file that is not created by default. This is a patch feature added to dmz firewall script. Please update your script if you want to use it. 
	local result = juci.readfile("/tmp/dmz_excluded_ports");
	return {result = (result or "")};
end

return {
	["excluded_ports"] = excluded_ports
};

