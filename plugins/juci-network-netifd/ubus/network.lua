#!/usr/bin/lua

local juci = require("juci/core"); 
local netstat = require("juci/netstat"); 
local ethernet = require("juci/ethernet"); 
local network = require("juci/network"); 

function network_list_services()
	local services = netstat.list(); 
	local result = { list = {} }; 
	for _,s in ipairs(services) do
		if(s.state == "LISTEN") then 
			table.insert(result.list, s); 
		end
	end
	print(json.encode(result)); 
end

function network_list_connected_clients()
	local clients = network.clients(); 
	print(json.encode({ clients = clients })); 	
end

juci.ubus({
	["services"] = network_list_services,
	["clients"] = network_list_connected_clients, 
}, arg); 
