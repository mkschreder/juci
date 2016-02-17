#!/usr/bin/lua

local juci = require("juci/core"); 

function fields(inputstr, sep)
	if sep == nil then
					sep = "%s"
	end
	local t={} ; i=1
	for str in string.gmatch(inputstr, "([^"..sep.."]+)") do
					t[i] = str
					i = i + 1
	end
	return t
end

function process_list()
	local res = {};  
	res["list"] = {}; 
	local stdout = juci.shell("top -b -n1"); 
	local lc = 0; 
	for line in stdout:gmatch("[^\r\n]+") do 
		local arr = fields(line, "%s"); 
		if(line:match("%s+PID.*")) then 
			res["fields"] = arr; 
		elseif(line:match("%d+.*") and res.fields) then
			local obj = {}; 
			for i,col in ipairs(res.fields) do 
				obj[col] = arr[i]; 
			end 
			table.insert(res.list, obj); 
		end
		lc = lc + 1; 
		
	end
	return res; 
end

return {
	["list"] = process_list
}; 
