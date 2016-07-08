#!/usr/bin/lua 

-- JUCI Lua Backend Server API
-- Copyright (c) 2016 Martin Schröder <mkschreder.uk@gmail.com>. All rights reserved. 
-- This module is distributed under GNU GPLv3 with additional permission for signed images.
-- See LICENSE file for more details. 


local juci = require("juci/core"); 
local json = require("juci/json"); 
local ubus = require("juci/ubus"); 

local function list_dir(dir) 
	local lines = juci.shell("ls %s",dir); 
	local files = {}; 
	for file in lines:gmatch("[^\r\n]+") do
		table.insert(files, file); 
	end
	return files; 
end

local function is_service(service)
	local files = list_dir("/etc/init.d/");
	for _,file in ipairs(files) do
		if(file == service) then
			return true
		end	
	end		
	return false
end

local function service_list()
	local files = list_dir("/etc/init.d/");
	local rcdfiles = list_dir("/etc/rc.d/"); 
	local svcs = ubus.call("service", "list", {});
	local services = {}; 
	local enabled = {}; 

	for _,file in ipairs(rcdfiles) do 
		if(file:sub(1,1) == "S") then 
			enabled[string.sub(file, 4, file:len())] = tonumber(file:sub(2,3)); 
		end
	end
	for _,file in ipairs(files) do
		local svc = {
			running = false, 
			enabled = false
		}; 
		local s = svcs[file]; 
		
		svc.start_priority = enabled[file]; 
		svc.enabled = enabled[file] ~= nil; 
		svc.running = s ~= nil; 		
		svc.name = file; 
		
		table.insert(services, svc); 
	end
	return {services = services}; 
end

local function service_start(service)
	if(is_service(service.name)) then
		juci.shell("/etc/init.d/%s start", service.name);
		return {}; 
	else 
		return { error = "Invalid service!"}; 
	end
end 

local function service_stop(service)
	if(is_service(service.name)) then
		juci.shell("/etc/init.d/%s stop", service.name);
		return {}; 
	end
	return { error = "Invalid service!"}; 
end 

local function service_enable(service)
	if(is_service(service.name)) then
		juci.shell("/etc/init.d/%s enable", service.name);
		return {}; 
	end
	return { error = "Invalid service!"}; 
end

local function service_disable(service)
	if(is_service(service.name)) then
		juci.shell("/etc/init.d/%s disable", service.name);
		return {}; 
	end
	return { error = "Invalid service!"}; 
end

local function service_reload(service)
	if(is_service(service.name))
	then
		juci.shell("/etc/init.d/%s reload", service.name);
	end
	return {}; 
end

local function service_status(service)
	local svcs = ubus.call("service", "list", {});	
	return { running = (svcs[service.name] ~= nil) };
end

return {
	["list"] = service_list,
	["start"] = service_start,
	["stop"] = service_stop, 
	["enable"] = service_enable, 
	["disable"] = service_disable, 
	["reload"] = service_reload, 
	["status"] = service_status
}; 
