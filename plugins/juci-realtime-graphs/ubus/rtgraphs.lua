#!/usr/bin/lua

local juci = require("juci/core"); 
local json = require("juci/json"); 

local function bwc_get_graph(opts)
	if(not opts.ethdevice) then print(json.encode({ error = "No device specified" })); return 0; end
	local graph = juci.shell("luci-bwc -i %s 2>/dev/null", opts.ethdevice); 
	return { graph = json.decode("["..graph.."]") }; 
end

return {
	["get"] = bwc_get_graph
}; 
