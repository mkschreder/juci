#!/usr/bin/lua

local mac = arg[1]; 
local f = assert(io.open("/usr/share/macdb/db.txt", "r")); 
string.gsub(mac, ":", ""); 
mac = mac:sub(0, 6);
local line = f:read("*l");  
while line do
	if(line:sub(0, 6) == mac) then print(line:sub(8)); break; end
	line = f:read("*l"); 
end
