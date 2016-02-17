#!/usr/bin/lua

local juci = require("juci/core"); 

function iptv_igmptable()
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
	res["table"] = tbl; 
	return res; 
end

return {
	["igmptable"] = iptv_igmptable
};
