#!/usr/bin/lua

require("JUCI"); 

function dsl_stats()
	local res = {}; 
	print(json.encode(res)); 
end

juci.ubus({
	["status"] = dsl_stats
}, arg); 
