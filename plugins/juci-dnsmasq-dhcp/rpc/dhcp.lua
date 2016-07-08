#!/usr/bin/lua

-- JUCI Lua Backend Server API
-- Copyright (c) 2016 Martin Schröder <mkschreder.uk@gmail.com>. All rights reserved. 
-- This module is distributed under GNU GPLv3 with additional permission for signed images.
-- See LICENSE file for more details. 

local juci = require("juci.core");
local network = require("juci.network");
local json = require("juci.json");

local function get_ipv4leases()
	local leases = network.ipv4leases();
	local result = {leases = {}}
	for _,i in pairs(leases) do 
		table.insert(result.leases, i);
	end
	return result; 
end

local function get_ipv6leases()
	local leases = network.ipv6leases();
	local result = {leases = {}}
	for _,i in pairs(leases) do 
		table.insert(result.leases, i);
	end
	return result; 
end

return {
	["ipv4leases"] = get_ipv4leases,
	["ipv6leases"] = get_ipv6leases
};
