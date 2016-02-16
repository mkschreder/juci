#!/usr/bin/lua

local juci = require("juci/core"); 

function macdb_lookup(opts)
	local res = {}; 
	local mac = ""; 
	if(opts["mac"]) then mac = string.upper(opts["mac"]); end
	local f = assert(io.open("/usr/share/macdb/db.txt", "r")); 
	mac = string.gsub(mac, ":", ""); 
	mac = mac:sub(0, 6);
	local line = f:read("*l");  
	while line do
		if(line:sub(0, 6) == mac) then res["manufacturer"] = line:sub(8); break; end
		line = f:read("*l"); 
	end
	f:close(); 
	print(json.encode(res)); 
end

return {
	["lookup"] = macdb_lookup
}; 
