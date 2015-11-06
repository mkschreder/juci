local juci = require("juci/core"); 

-- parse out dhcp information 
local function read_dhcp_info()
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
local function read_arp_info()
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
	
local function read_ip6_clients()
	local proc = io.popen("ip -6 neigh show"); 
	local result = {}; 
	local line = proc:read("*l");
	while line do 
		local ip,_,dev,_,mac,status = line:match("(%S+)%s+(%S+)%s+(%S+)%s+(%S+)%s+(%S+)%s+(%S+)"); 
		-- some lines also contain "router" string in place of status. Maybe we should parse values as key/value pairs instead? 
		local _,_,_,_,_,_,status2 = line:match("(%S+)%s+(%S+)%s+(%S+)%s+(%S+)%s+(%S+)%s+(%S+)%s+(%S+)"); 
		local obj = {
			ip6addr = ip, 
			ip6status = status,
			device = dev, 
			macaddr = mac,
			router = false 
		};
		if(status2) then 
			if(status == "router") then
				obj.router = true
			end
			obj.ip6status = status2; 
		end
		table.insert(result, obj); 
		line = proc:read("*l"); 
	end
	proc:close(); 
	return result; 
end 

-- to get dhcp mac addresses: awk '$1 == "#"{print substr($9, 0, index($9, "/") - 1) " " $2}' /tmp/hosts/odhcpd | xargs ndisc6 -1 | awk '/Target.*link.*/{print $4}'
local function read_ip6_dhcp_info()
	local lines = juci.readfile("/tmp/hosts/odhcpd"); 
	if(not lines) then return {}; end
	local result = {}; 
	for line in lines:gmatch("[^\r\n]+") do
		-- scanf(line, "# %s %s %x %s %d %x %d %s", clients6[cno].device, clients6[cno].duid, &iaid, clients6[cno].hostname, &ts, &id, &length, clients6[cno].ip6addr)
		-- # br-lan 000415a02f71b2054d230f438af04844b708 99bf8deb vlatko-HP-ProBook-650-G1 1445260051 187 128 2a03:8000:3e3:300::187/128
		-- note: iaid is last 4 bytes of mac address. (why the hell not all of them?)
		local device,duid,iaid,hostname,ts,id,length,ip6addr; 
		device,duid,iaid,hostname,ts,id,length,ip6addr = line:match("# (%S+)%s+(%S+)%s+(%S+)%s+(%S+)%s+(%S+)%s+(%S+)%s+(%S+)%s+(%S+).*"); 
		-- this will happen if dhcp server does not have a hostname, then line will look like this: 
		-- # br-lan 00042aa82c08c6903678fc7befd58766add6 7544771b - 0 289 128
		if(not device or device == "") then 
			device,duid,iaid = line:match("# (%S+)%s+(%S+)%s+(%S+).*"); 
		end
		if(device and duid) then 
			result[iaid] = {
				device = device, 
				duid = duid, 
				iaid = iaid, 
				hostname = hostname, 
				ts = ts, 
				id = id, 
				length = length, 
				ip6addr = ip6addr
			}; 
		end
	end
	return result; 
end

local function read_clients()
	local result = read_arp_info(); -- arp info is usually better for getting clients that are actually connected
	local dhcp_leases = read_dhcp_info(); 
	local ip6clients = read_ip6_clients(); 
	local ip6dhcp = read_ip6_dhcp_info(); 

	-- combine fields
	for mac,dhcp in pairs(dhcp_leases) do 
		local r = result[mac]; 
		if r then 
			for k,v in pairs(dhcp) do 
				r[k] = v; 
			end
		end
	end

	for _,cl in ipairs(ip6clients) do
		-- find in the dhcp6 table an entry that belongs to our mac address
		if cl.macaddr then
			local iaid = cl.macaddr:gsub(":", ""):sub(5); 
			local dhcp = ip6dhcp[iaid]; 
			if dhcp then 
				cl.ip6duid = dhcp.duid; 
				if not cl.hostname then cl.hostname = dhcp.hostname; end
				cl.ip6hostid = dhcp.id; 
			end
		end

		if result[cl.macaddr] then 
			result[cl.macaddr].ip6addr = cl.ip6addr; 
			result[cl.macaddr].ip6status = cl.ip6status; 
			result[cl.macaddr].ip6duid = cl.ip6duid; 
			result[cl.macaddr].ip6hostid = cl.ip6hostid; 
			if not result[cl.macaddr].hostname then result[cl.macaddr].hostname = cl.hostname; end 
		elseif(cl.macaddr ~= nil) then 
			result[cl.macaddr] = cl; 
		end
	end
	return result; 
end


local function network_list_connected_clients(opts)
		local clients_map = read_clients(); 
	local clients_list = {}; 
	for mac,cl in pairs(clients_map) do 
		--local js = juci.shell("/usr/lib/rpcd/cgi/juci.macdb lookup '{\"mac\": \""..mac.."\"}'"); 
		--cl.manufacturer = json.decode(js)["manufacturer"]; 
		table.insert(clients_list, cl); 
	end
	return clients_list; 
end

return {
	clients = network_list_connected_clients,
	ipv6neigh = read_ip6_clients
}; 
