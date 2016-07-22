#!/usr/bin/lua

-- JUCI Lua Backend Server API
-- Copyright (c) 2016 Martin Schröder <mkschreder.uk@gmail.com>. All rights reserved. 
-- This module is distributed under GNU GPLv3 with additional permission for signed images.
-- See LICENSE file for more details. 


local juci = require("orange/core"); 

local SHADOW_FILE = "/etc/orange/shadow"; 

local function shadow_table()
	local result = {}; 
	local shadow = juci.readfile("/etc/shadow"); 
	for line in shadow:gmatch("[^\r\n]+") do 
		local fields = {}; 
		for field in line:gmatch("[^:]+") do
			table.insert(fields, field); 
		end
		table.insert(result, fields); 
	end
	return result; 
end

local function user_set_password(opts)
	if not opts["password"] then return 5; end
	local session = SESSION.get();
	if session.username ~= opts.username and not SESSION.access("juci", "passwd", "otheruser", "w") then 
		return { error = "Can not change password for another user!" }; 
	end
	if not SESSION.access("juci", "passwd", "self", "w") then 
		return { error = "Permission denied!" };
	end
	local oldchk = juci.shell("awk '/%s/{printf $2}' %s", opts.username, SHADOW_FILE); 
	local oldhash = juci.shell("printf %s | sha1sum | awk '{printf $1}'", opts.oldpassword); 
	if oldhash ~= oldchk then
		return { error = "Invalid username/password!"}; 
	end
	local newhash = juci.shell("printf %s | sha1sum | awk '{printf $1}'", opts.password); 
	juci.shell("sed -i 's/%s.*/%s %s/g' %s", opts.username, opts.username, newhash, SHADOW_FILE); 
	return {
		["stdout"] = stdout
	}; 
end

local function user_list(opts)
	-- list only users that are configured for rpc logins
	local all_users = juci.shell("awk '{print $1;}' %s", SHADOW_FILE);  
	local users = {};
	local listothers = SESSION.access("juci", "passwd", "otheruser", "w"); 
	local session = SESSION.get(); 
	for user in all_users:gmatch("[^\r\n]+") do
		if(not listothers) then 
			if(session.username == user) then table.insert(users, user); end
		else
			table.insert(users, user); 
		end
	end
	return { users = users };  
end

return {
	["setpassword"] = user_set_password,
	["listusers"] = user_list
}; 
