local juci = require("juci/core"); 

local function list_services(opts)
	local netstat = juci.shell("netstat -nlp 2>/dev/null");
	local services = {};  
	for line in netstat:gmatch("[^\r\n]+") do
		local proto, rq, sq, local_address, remote_address, state, process = line:match("([^%s]+)%s+([^%s]+)%s+([^%s]+)%s+([^%s]+)%s+([^%s]+)%s+([^%s]+)%s+([^%s]+)"); 
		if(local_address) then 
			local listen_ip, listen_port = local_address:match("([^:]+):(.*)"); 
			local pid,path = process:match("(%d+)/(.*)"); 
			table.insert(services, {
				proto = proto, 
				listen_ip = listen_ip, 
				listen_port = listen_port, 
				pid = pid, 
				name = path,
				state = state
			}); 
		end
	end
	return services; 
end

return {
	list = list_services
}
