local juci = require("juci/core"); 

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
	return clients_list; 
end

return {
	clients = network_list_connected_clients
}; 
