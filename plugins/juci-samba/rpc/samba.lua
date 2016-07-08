#!/usr/bin/lua

-- JUCI Lua Backend Server API
-- Copyright (c) 2016 Martin Schröder <mkschreder.uk@gmail.com>. All rights reserved. 
-- This module is distributed under GNU GPLv3 with additional permission for signed images.
-- See LICENSE file for more details. 

local juci = require("juci.core");
local json = require("juci.json");

local function folder_tree()
	return juci.file.folder_tree();
end

local function autocomplete(opts)
	local ret = juci.file.autocomplete(opts);
	if(ret == 1) then return ret; end
	return ret;
end

return {
	["folder_tree"] = folder_tree,
	["autocomplete"] = autocomplete,
};
