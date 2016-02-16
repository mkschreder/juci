#!/usr/bin/lua

-- OpenWRT Switch Config Plugin for JUCI
-- Copyright (c) 2016 Martin K. Schröder <mkschreder.uk@gmail.com>

local juci = require("juci/core"); 
local json = require("juci/json"); 

local function get_port_status()
	local links = juci.shell("swconfig dev switch0 show | grep link"); 
	local state = { ports = {} }; 
	for line in links:gmatch("[^\r\n]+") do 
		-- link: port:4 link:up speed:1000baseT full-duplex auto
		-- link: port:4 link:down
		local id,status = line:match("%s+link:%s+port:(%d+)%s+link:(%S+).*"); 
		if(id and status) then 
			table.insert(state.ports, { 
				id = tonumber(id), 
				state = status
			}); 
		end
	end
	return state; 
end

return {
	status = get_port_status
}; 
