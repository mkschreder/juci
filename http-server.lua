local http = require("http")
local fs = require('fs')
local uv = require("uv"); 
local json = require("json"); 

require("ubus"); 

local PORT = 8000


local conn = ubus.connect()
if not conn then
	error("Failed to connect to ubus")
end


local mime_types = {
	html = "text/html", 
	js = "application/javascript", 
	css = "text/css", 
	jpg = "image/jpeg", 
	jpeg = "image/jpeg", 
	png = "image/png",
	woff = "application/x-font-woff",
	text = "text/plain"
}; 

local rpcid = 0; 

local objects = {}; 
local namespaces = conn:objects()
for i, n in ipairs(namespaces) do
	local signatures = conn:signatures(n)
	local methods = {}; 
	--print("object="..n); 
	for p, s in pairs(signatures) do
		local meth = {}; 
		--print("\tprocedure=" .. p)
		for k, v in pairs(s) do
			meth[k] = v; 
			--print("\t\tattribute=" .. k .. " type=" .. v)
		end
		methods[p] = meth; 
	end
	objects[n] = methods; 
end

http.createServer({}, function(req, res)
  --print(json.stringify(req)); 
  local path = req.url; 
  if path == "/" then path = "index.html"; end
  path = "/www/"..path; 
  
  local ext = path:match("^.+(%..+)$") or "text"; 
  
	local not_found = "Not found!"; 
	
	if(req.method == "POST" and req.url == "/ubus") then 
		local buffer = {}

		req:on('data', function(chunk)
			table.insert(buffer, chunk)
		end)
		req:on('end', function()
			local data = ""; 
			for i,v in ipairs(buffer) do data = data..v; end
			local post = json.parse(data);
			local result = { jsonrpc = "2.0", id = rpcid };
			rpcid = rpcid +1;   
			if post.method == "list" then 
				
				result["result"] = objects; 
			elseif post.method == "call" then 
				local obj_id, meth_id, params = post.params[2], post.params[3], post.params[4]; 
				print("JSON CALL: "..obj_id.." "..meth_id.." "..json.stringify(params)); 
				if(objects[obj_id] and objects[obj_id][meth_id] and objects[obj_id][meth_id]["ubus_rpc_session"]) then 
					params["ubus_rpc_session"] = post.params[1]; 
				end
				local r,code = conn:call(obj_id, meth_id, params); 
				result["result"] = {code or 0, r or {}}; 
			end
			local body = json.stringify(result); 
			res:setHeader("Content-Type", "text/json"); 
			res:setHeader("Content-Length", #body)
			print("JSON RESP: "..body); 
			res:finish(body); 
		end)
	else
		if fs.existsSync(path..".gz") then 
			print("Found gzipped version of "..path); 
			path = path..".gz"; 
			res:setHeader("Content-Encoding", "gzip"); 
		end
		
		if not fs.existsSync(path) then 
			res:setHeader("Content-Type", "text/plain")
			res:setHeader("Content-Length", #not_found)
			res:finish(not_found)
		else
			local body = fs.readFileSync(path); 
			
			res:setHeader("Content-Type", mime_types[ext])
			res:setHeader("Content-Length", #body)
			
			res:finish(body)
		end
	end
end):listen(PORT)
print("Server listening at http://localhost:"..PORT)

uv.run(); 
