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

function network_list_connected_clients(opts)
	-- parse out dhcp information 
	function read_dhcp_info()
		local dhcp = {}; 
		local dhcp_leases = io.open("/var/dhcp.leases", "r"); 
		if not dhcp_leases then return {}; end
		local line = dhcp_leases:read("*l"); 
		while line do
			local leasetime, macaddr, ipaddr, hostname = line:match("([^%s]+)%s+([^%s]+)%s+([^%s]+)%s+([^%s]+)"); 
			if macaddr then 
				dhcp[macaddr] = {
					leasetime = leasetime, 
					ipaddr = ipaddr, 
					hostname = hostname, 
					macaddr = macaddr
				}; 
			end 
			line = dhcp_leases:read("*l"); 
		end
		dhcp_leases:close(); 
		return dhcp; 
	end
	
	-- parse arp information (this can be out of date sometimes though! you must ping a client to know that it actually is alive!)
	function read_arp_info()
		local arp = {}; 
		local proc_arp = io.open("/proc/net/arp", "r"); 
		
		if(not proc_arp) then return {}; end
		-- skip first line with headers
		proc_arp:read("*l"); 
		
		local line = proc_arp:read("*l"); 
		while line do 
			local ip, hwtype, flags, macaddr, mask, device = line:match("([^%s]+)%s+([^%s]+)%s+([^%s]+)%s+([^%s]+)%s+([^%s]+)%s+([^%s]+)"); 
			if ip and macaddr and device then 
				arp[macaddr] = {
					ipaddr = ip, 
					macaddr = macaddr, 
					device = device
				}; 
			end
			line = proc_arp:read("*l"); 
		end
		proc_arp:close(); 
		return arp; 
	end 
	
	function read_clients()
		local result = read_arp_info(); -- arp info is usually better for getting clients that are actually connected
		local dhcp_leases = read_dhcp_info(); 
		
		-- combine fields
		for mac,dhcp in pairs(dhcp_leases) do 
			local r = result[mac]; 
			if r then 
				for k,v in pairs(dhcp) do 
					r[k] = v; 
				end
			end
		end
		return result; 
	end
	
	local clients_map = read_clients(); 
	local clients_list = {}; 
	for mac,cl in pairs(clients_map) do 
		--local js = juci.shell("/usr/lib/rpcd/cgi/juci.macdb lookup '{\"mac\": \""..mac.."\"}'"); 
		--cl.manufacturer = json.decode(js)["manufacturer"]; 
		table.insert(clients_list, cl); 
	end
	print(json.encode({ clients = clients_list })); 
end

function network_list_network_adapters(opts)
	function words(str) 
		local f = {}; 
		local count = 0; 
		for w in str:gmatch("%S+") do table.insert(f, w); count = count + 1; end
		return count,f; 
	end
	
	function ipv4parse(ip)
		if not ip then return "",""; end
		local ip,num = ip:match("([%d\.]+)/(%d+)"); 
		local mask = "0.0.0.0"; 
		if num then 
			local inet_mask = "255"; 
			for i = 16,32,8 do 
				if i <= tonumber(num) then 
					inet_mask = inet_mask..".255";
				else 
					inet_mask = inet_mask..".0"; 
				end
			end
			mask = inet_mask; 
		end
		return ip,mask; 
	end
	
	function ipv6parse(ip)
		if not ip then return "",""; end
		local ip,num = ip:match("([%w:]+)/(%d+)"); 
		-- TODO: return also mask/prefix? whatever..
		return ip; 
	end
	
	local adapters = {}; 
	local obj = {}; 
	local ip_output = juci.shell("ip addr"); 
	for line in ip_output:gmatch("[^\r\n]+") do
		local count,fields = words(line); 
		if fields[1] then 
			if fields[1]:match("%d+:") then
				if(next(obj) ~= nil) then table.insert(adapters, obj); end
				obj = {}; 
				obj.name = fields[2]:match("([^:]+)"); 
				obj.flags = fields[3]:match("<([^>]+)>"); 
				-- parse remaining pairs after flags
				for id = 4,count,2 do
					obj[fields[id]] = fields[id+1]; 
				end
			elseif fields[1]:match("link/.*") then 
				obj.link_type = fields[1]:match("link/(.*)"); 
				obj.macaddr = fields[2]; 
				-- parse remaining pairs after link type
				for id = 3,count,2 do
					obj[fields[id]] = fields[id+1]; 
				end
			elseif fields[1] == "inet" then
				if not obj.ipv4 then obj.ipv4 = {} end
				local ipobj = {}; 
				ipobj.addr,ipobj.mask = ipv4parse(fields[2]); 
				-- parse remaining pairs for ipaddr options
				for id = 3,count,2 do
					ipobj[fields[id]] = fields[id+1]; 
				end
				table.insert(obj.ipv4, ipobj); 
			elseif fields[1] == "inet6" then
				if not obj.ipv6 then obj.ipv6 = {} end
				local ipobj = {}; 
				ipobj.addr = ipv6parse(fields[2]); 
				-- parse remaining pairs for ipaddr options
				for id = 3,count,2 do
					ipobj[fields[id]] = fields[id+1]; 
				end
				table.insert(obj.ipv6, ipobj); 
			else 
				-- all other lines are assumed to consist of only pairs
				for id = 1,count,2 do
					obj[fields[id]] = fields[id+1]; 
				end
			end
		end
	end
	-- add last parsed adapter to the list as well
	if(next(obj) ~= nil) then table.insert(adapters, obj); end
	
	print(json.encode({ adapters = adapters })); 
end

juci.ubus({
	["services"] = network_list_services,
	["clients"] = network_list_connected_clients, 
	["adapters"] = network_list_network_adapters
}, arg); 
