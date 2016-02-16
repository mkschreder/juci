#!/usr/bin/lua

local juci = require("juci.core");
local network = require("juci.network");
local json = require("juci.json");

local function get_ipv4leases()
	local leases = network.ipv4leases();
	local result = {leases = {}}
	for _,i in pairs(leases) do 
		table.insert(result.leases, i);
	end
	print(json.encode(result));
end

local function get_ipv6leases()
	local leases = network.ipv6leases();
	local result = {leases = {}}
	for _,i in pairs(leases) do 
		table.insert(result.leases, i);
	end
	print(json.encode(result));
end

return {
	["ipv4leases"] = get_ipv4leases,
	["ipv6leases"] = get_ipv6leases
};
