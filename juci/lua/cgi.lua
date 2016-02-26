
local QUERY_STRING = nil; 
local function query(name)
	if(QUERY_STRING == nil) then
		QUERY_STRING = {}; 
		local qstr = os.getenv("QUERY_STRING"); 
		if(qstr) then
			for line in qstr:gmatch("[^&]+") do 
					local k,v = line:match("([^=]+)=(.*)"); 
					QUERY_STRING[k] = v; 
			end
		end
	end
	if(name) then
		return QUERY_STRING[name]; 
	end
	return QUERY_STRING; 
end

return {
	query = query
}
