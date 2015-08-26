#!/usr/bin/lua

require("JUCI"); 

function dsl_stats()
	-- until we make it a lua script
	local res = juci.shell("ubus call juci.broadcom.dsl.bin status"); 
	print(res); 
end

juci.ubus({
	["status"] = dsl_stats
}, arg); 
