#!/usr/bin/lua

-- JUCI Lua Backend Server API
-- Copyright (c) 2016 Martin Schröder <mkschreder.uk@gmail.com>. All rights reserved. 
-- This module is distributed under GNU GPLv3 with additional permission for signed images.
-- See LICENSE file for more details. 

local juci = require("orange/core"); 
local PATH = "/tmp/usbnets"

function list_modems()
	local data = juci.shell("ls /dev/tty*S*");
	local modems = {};
	for line in data:gmatch("[^\r\n]+") do
		table.insert(modems, line);
	end
	if next(modems) == nil then
		data = juci.shell("ls /dev/tts/*");
		for line in data:gmatch("[\r\n]+") do
			table.insert(modems, line);
		end
	end
	return { modems = modems };
end

function list_4g_modems()
	local file = io.open(PATH, "r");
	if(file == nil) then
		return {info = "could not open file"};
	end;
	local modems = {};
	local tmp = {};
	for line in io.lines(PATH) do
		tmp = {};
		for word in line:gmatch("%S+") do table.insert(tmp, word) end
		local name = "";
		for i=8,100,1
		do
			if tmp[i] then
				name = name..tmp[i].." ";
			else
				break;
			end
		end
		table.insert(modems, {service=tmp[7], dev=tmp[6], name=name, ifname=tmp[5]});
		if next(modems) then
			return {modems = modems};
		end
	end
	return {info = "no data"};
end

return {
	["list"] = list_modems,
	["list4g"] = list_4g_modems
}; 
