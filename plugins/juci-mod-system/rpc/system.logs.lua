local juci = require("orange/core"); 

local function logs_download()
	local name = "logs-"..os.date("%Y-%m-%d")..".txt"; 
	local id,filename = juci.createDownload(name, "text/plain"); 
	juci.shell("logread > %s", filename);
	return { id = id }; 
end

return {
	download = logs_download
}
