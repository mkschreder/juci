#!/usr/bin/lua

-- JUCI Lua Backend Server API
-- Copyright (c) 2016 Martin Schröder <mkschreder.uk@gmail.com>. All rights reserved. 
-- This module is distributed under GNU GPLv3 with additional permission for signed images.
-- See LICENSE file for more details. 

local juci = require("orange/core"); 
local netstat = require("orange/netstat"); 
local ethernet = require("orange/ethernet"); 
local network = require("orange/network"); 

function network_list_services()
	local services = netstat.list(); 
	local result = { list = {} }; 
	for _,s in ipairs(services) do
		if(s.state == "LISTEN") then 
			table.insert(result.list, s); 
		end
	end
	return result; 
end

function network_list_connected_clients(args)
	local clients = network.clients(); 
	local result = {}; 
	if(args.ping) then
		for _,cl in ipairs(clients) do	
			if(cl.ipaddr ~= nil and string.len(cl.ipaddr) > 0) then 
				local alive = juci.shell("ping -c 1 -W 1 %s | grep 'packets received' | awk '{ if($1 == $4) { print 1 } else { print 0 } }'", cl.ipaddr); 
				if alive:match("1") then 
					table.insert(result, cl);
				end
			end
		end
	else 
		result = clients; 
	end
	return { clients = result }; 	
end

function network_nat_table()
	-- tcp      6 2 TIME_WAIT src=127.0.0.1 dst=127.0.0.1 sport=60962 dport=40713 src=127.0.0.1 dst=127.0.0.1 sport=40713 dport=60962 [ASSURED] mark=0 use=2
	local file = io.open("/proc/net/ip_conntrack"); 
	local result = {table={}}; 
	if(not file) then
		return result; 
	end
	local line = file:read("*l"); 
	while(line) do
		local proto,_,_,state,remote_ip,local_ip,remote_port,local_port = line:match("^(%S+)%s+(%S+)%s+(%S+)%s+(%S+)%s+src=(%S+)%s+dst=(%S+)%s+sport=(%S+)%s+dport=(%S+).*"); 	
		if(proto and state) then
			table.insert(result.table, {
				proto = proto, 
				state = state, 
				remote_ip = remote_ip, 
				local_ip = local_ip, 
				remote_port = remote_port, 
				local_port = local_port
			}); 
		end
		line = file:read("*l"); 
	end
	file:close(); 
	return result; 
end

function list_protos()
	local data = juci.shell("grep -roh 'proto_\\(.*\\)_init' /lib/netifd/proto/ | sed -e 's|proto_\\(.*\\)_init|\\1|g'");
	local protos = {};
	for line in data:gmatch("[^\r\n]+") do
		table.insert(protos, line);
	end
	return { protocols = protos };
end

local function network_load()
	return {
		active_connections = tonumber(juci.shell("cat /proc/sys/net/netfilter/nf_conntrack_count") or "0"), 
		max_connections = tonumber(juci.shell("cat /proc/sys/net/netfilter/nf_conntrack_max") or "0")
	}; 	
end

local function network_nameservers()
	local out = juci.shell("awk '/nameserver/{print $2}' /var/resolv.conf.auto"); 
	local result = { nameservers = {} }; 
	for line in out:gmatch("[^\r\n]+") do
		table.insert(result.nameservers, line); 
	end
	return result; 
end

return {
	["load"] = network_load, 
	["nameservers"] = network_nameservers, 
	["services"] = network_list_services,
	["clients"] = network_list_connected_clients, 
	["nat_table"] = network_nat_table,
	["protocols"] = list_protos
}; 
