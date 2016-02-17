#!/usr/bin/lua 

local juci = require("juci.core"); 

local function upnp_list_open_ports()
	local result = { ports = {} }; 
	local stdout = juci.shell("iptables --line-numbers -t nat -xnvL MINIUPNPD | tail -n +3"); 
	for line in stdout:gmatch("[^\r\n]+") do 
		-- num      pkts      bytes target     prot opt in     out     source               destination
		-- 1       16867  1155229 postrouting_rule  all  --  *      *       0.0.0.0/0            0.0.0.0/0            /* user chain for postrouting */
		local num,pkts,bytes,target,proto,opt,_,_,src,dst,_,src_port,dst_port = line:match("^(%S+)%s+(%S+)%s+(%S+)%s+(%S+)%s+(%S+)%s+(%S+)%s+(%S+)%s+(%S+)%s+(%S+)%s+(%S+)%s+(%S+)%s+dpt:(%S+)%s+to:(%S+)"); 
		table.insert(result.ports, {
			num = num, 
			packets = pkts, 
			bytes = bytes, 
			target = target, 
			proto = proto, 
			opt = opt, 
			src = src, 
			dst = dst,
			src_port = src_port, 
			dst_port = dst_port
		}); 
	end
	return result; 
end

return {
	ports = upnp_list_open_ports
}; 
