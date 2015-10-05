#!/usr/bin/lua

local json = require("juci/json"); 

function wireless_scanresults()
	local f = assert(io.popen("wlctl -i wl1 scanresults")); 
	local aps = {}; 
	local obj = {}; 
	local resp = {}; 
	resp["access_points"] = aps; 
	local s = f:read("*l"); 
	while s do
		local fields = {}
		for w in s:gmatch("%S+") do table.insert(fields, w) end
		for i,v in ipairs(fields) do
			if v == "SSID:" then 
				x = {}; 
				for w in s:gmatch("[^\"]+") do table.insert(x, w) end
				if next(obj) ~= nil then table.insert(aps, obj) end
				obj = {}; 
				obj["ssid"] = x[2]; 
			end
			if v == "Mode:" then obj["mode"] = fields[i+1] end
			if v == "RSSI:" then obj["rssi"] = fields[i+1] end
			if v == "Channel:" then obj["channel"] = fields[i+1] end
			if v == "BSSID:" then obj["bssid"] = fields[i+1] end
			if v == "multicast" and fields[i+1] == "cipher:" then obj["multicast_cipher"] = fields[i+2] end
			if v == "AKM" then obj["cipher"] = fields[i+2] end
			if v == "Chanspec:" then obj["frequency"] = fields[i+1] end
			if v == "Primary" and fields[i+1] == "channel:" then obj["primary_channel"] = fields[i+2] end
			if v == "WPS:" then obj["wps_version"] = fields[i+1] end
		end
		s = f:read("*l"); 
	end
	f:close(); 
	print(json.encode(resp)); 
end

if arg[1] == ".methods" then 
	print("scanresults");
elseif arg[1] == "scanresults" then 
	wireless_scanresults();
else 
	io.write("Unknown method!\n"); 
end
