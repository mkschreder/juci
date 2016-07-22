#!/usr/bin/lua

-- JUCI Lua Backend Server API
-- Copyright (c) 2016 Martin Schröder <mkschreder.uk@gmail.com>. All rights reserved. 
-- This module is distributed under GNU GPLv3 with additional permission for signed images.
-- See LICENSE file for more details. 


local juci = require("orange/core"); 
local juci = require("orange/core");      
local json = require("orange/json");      

local function backup_create(opts)
	local filename = "backup-"..os.date("%Y-%m-%d")..".tar.gz"; 
	local did, outfile = juci.createDownload(filename, "application/x-targz"); 
	if(opts.password and opts.password ~= "" and string.len(opts.password)) then 
		juci.shell(string.format("sysupgrade --create-backup - | openssl des3 -pass pass:\"%s\" >> %s", opts.password, outfile)); 
	else
		juci.shell("sysupgrade --create-backup - >> %s", outfile); 
	end 
	return {
		id = did
	}; 
end 

local function backup_restore(opts)
	local res = {}; 
	if(opts.pass ~= "" and opts.pass ~= nil) then 
		local decrypt = juci.shell(string.format('openssl des3 -d -in /tmp/backup.tar.gz -out /tmp/backup.tar.gz.dec -pass pass:"%s" 2>/dev/null && echo "OK"', opts.pass)); 
		if(decrypt == "OK\n") then
			juci.shell("mv /tmp/backup.tar.gz.dec /tmp/backup.tar.gz"); 
			res["stdout"] = juci.shell("sysupgrade --restore-backup /tmp/backup.tar.gz"); 
		else
			res["error"] = "Invalid Password!"; 
		end
	else
		res["stdout"] = juci.shell("sysupgrade --restore-backup /tmp/backup.tar.gz 2>&1"); 
		if(res.stdout and (res.stdout:match("invalid") or res.stdout:match("Error"))) then res.error = res.stdout; end
	end
	return res; 
end

local function backup_clean()
	local res = {}; 
	res["stdout"] = juci.shell("sysupgrade --clean"); 
	return res; 
end

local function backup_get_features()
	local res = { }; 
	if("" ~= juci.shell("openssl version")) then res.encryption = true; else res.encryption = false end
	res.comment = false; 
	return res; 
end

return {
	["backup"] = backup_create,
	["restore"] = backup_restore, 
	["features"] = backup_get_features, 
	["clean"] = backup_clean
}; 

