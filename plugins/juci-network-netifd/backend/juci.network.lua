#!/usr/bin/lua

require("JUCI"); 

function network_list_services(opts)
	local netstat = juci.shell("netstat -nlp");
	local services = {};  
	local result = { list = services }; 
	for line in netstat:gmatch("[^\r\n]+") do
		local proto, rq, sq, local_address, remote_address, state, process = line:match("([^%s]+)%s+([^%s]+)%s+([^%s]+)%s+([^%s]+)%s+([^%s]+)%s+([^%s]+)%s+([^%s]+)"); 
		if(local_address and state == "LISTEN") then 
			local listen_ip, listen_port = local_address:match("([^:]+):(.*)"); 
			local pid,path = process:match("(%d+)/(.*)"); 
			table.insert(services, {
				proto = proto, 
				listen_ip = listen_ip, 
				listen_port = listen_port, 
				pid = pid, 
				name = path
			}); 
		end
	end
	print(json.encode(result)); 
end

juci.ubus({
	["services"] = network_list_services
}, arg); 
