#!/usr/bin/lua

local juci = require("juci/core"); 
local fs = require("luv.fs"); 
require("ubus")

function netmode_current(params)
	local entries = fs.scandirSync("/etc/netmodes/"); 
	for name,typ in entries do
		if(typ == "directory") then 
			table.insert(dirlist, name); 
		end
	end
	-- not go through all directories and see if any mode matches exactly
	
end

function netmode_select(params)
	if not params or not params.netmode then 
		return { error = "Please supply netmode argument!"}; 
	end
	local src = "/etc/netmodes/config_"..string.gsub(params.netmode, "[^A-Za-z0-9]*", ""); 
	if fs.existsSync(src) then 
		local stdout = juci.shell("cp -r %s/* /etc/config/", src); 
		juci.shell("uci set netmode.setup.curmode=%s; uci commit netmode", params.netmode); 
		juci.shell("reboot&"); 
		return { netmode = params.netmode, configs_dir = src}; 
	else 
		return { error = "Netmode not found"}; 
	end
end

return {
	["current"] = netmode_current,
	["select"] = netmode_select
}; 
