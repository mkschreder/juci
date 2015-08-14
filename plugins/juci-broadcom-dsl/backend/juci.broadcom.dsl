#!/usr/bin/lua

require("JSON"); 

function dsl_stats()
	local res = {}; 
	local tbl = {}; 
	local obj = {}; 
	local field_names = {"bridge", "device", "srcdev", "tags", "lantci", "wantci", "group", "mode", "rx_group", "source", "reporter", "timeout", "index", "excludpt"}; 
	
	local f = assert(io.popen("igmpinfo", "r")); 
	local line = f:read("*l"); 
	while line do
		local fields = {}
		local obj = {}; 
		for w in s:gmatch("[^\t]+") do table.insert(fields, w) end
		for i,v in ipairs(fields) do
			obj[field_names[i]] = v; 
		end
		table.insert(tbl, obj); 
		line = f:read("*l"); 
	end
	f:close(); 
	res["dslstats"] = {}; 
	print(json.encode(res)); 
end

local _calls = {
	["dslstats"] = dsl_stats
}; 

if arg[1] == ".methods" then 
	print("dslstats");
elseif _calls[arg[1]] then 
	local params = {}; 
	if arg[2] then params = json.decode(arg[2]); end
	_calls[arg[1]](params); 
else 
	io.write("Unknown method!\n"); 
end
