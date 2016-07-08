#!/usr/bin/lua

-- JUCI Lua Backend Server API
-- Copyright (c) 2016 Martin Schröder <mkschreder.uk@gmail.com>. All rights reserved. 
-- This module is distributed under GNU GPLv3 with additional permission for signed images.
-- See LICENSE file for more details. 

local juci = require("juci/core"); 

function diag_ping(opts)
	local res = {}; 
	if(not opts["host"]) then return; end; 
	res["stdout"] = juci.shell("ping -c 5 -W 1 %s", opts["host"]); 
	return res; 
end

function diag_ping6(opts)
	local res = {}; 
	if(not opts["host"]) then return; end; 
	res["stdout"] = juci.shell("ping6 -c 5 -W 1 %s", opts["host"]); 
	return res; 
end

function diag_traceroute(opts)
	local res = {}; 
	if(not opts["host"]) then return; end; 
	res["stdout"] = juci.shell("traceroute -q 1 -w 1 -n %s", opts["host"]); 
	return res; 
end

function diag_traceroute6(opts)
	local res = {}; 
	if(not opts["host"]) then return; end; 
	res["stdout"] = juci.shell("traceroute6 -q 1 -w 2 -n %s", opts["host"]); 
	return res; 
end

return {
	["ping"] = diag_ping, 
	["ping6"] = diag_ping6, 
	["traceroute"] = diag_traceroute,
	["traceroute6"] = diag_traceroute6
}; 
