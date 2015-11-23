local table = require("table"); 
local string = require("string"); 
local io = require("io"); 
local json = require("juci/json"); 
local posix = require("posix.unistd"); 
local sys = require("posix.sys.wait");
local stdio = require("posix.stdio");

local base = _G

--module("juci"); 

local function readfile(name)
	local f = io.open(name, "r");
	if(not f) then return nil; end 
	local s = f:read("*a"); 
	s = s:gsub("\n+$", "");  -- remove trailing new line
	f:close(); 
	return s; 
end

local function log(source, msg)
	local fd = io.open("/dev/console", "w"); 
	fd:write((source or "juci")..": "..(msg or "").."\n"); 
	fd:close();
end

local function exec(cmd, args)
	-- ask the shell which command we should run
	local pt = io.popen("which "..cmd); 
	if(not pt) then return -1, "", "no 'which' command found! "..(cmd or ""); end 
	local cmd = tostring(pt:read("*a")):gsub("\n", ""); 
	if(cmd == "") then return -1, "", "no such file or directory! "..(cmd or ""); end
	pt:close(); 
	
	local rd, wr = posix.pipe()
	local rderr, wrerr = posix.pipe()
	io.flush(); 
	local child = posix.fork(); 
	if child == 0 then
		posix.close(rd)
		posix.close(rderr); 
		posix.dup2(wr, stdio.fileno(io.stdout))
		posix.dup2(wrerr, stdio.fileno(io.stderr))
		posix.exec(cmd, args)
		os.exit(2)
	end
	posix.close(wr)
	posix.close(wrerr); 
	
	local str = posix.read(rd, 65535)
	local strerr = posix.read(rderr, 65535); 
	posix.close(rd); 
	posix.close(rderr);

	local _,_,ret = sys.wait(child)
	return ret, str, strerr; 
end

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

local function shell(fmt, ...)
	for k,v in base.ipairs(arg) do
		-- TODO: this is inherently dangerous way to do shell commands. 
		-- This way gets rid of basic forms of injection attacks, but
		-- it still may miss some others that I did not think about. 
		if base.type(v) == "string" then 
			arg[k] = v:gsub("[;*|><\]", "\\%1");
		end
	end
	local p = base.assert(io.popen(string.format(fmt, base.unpack(arg)))); 
	local s = p:read("*a"); 
	local r = p:close();
	-- there is no 'true' or 'false' in process return status world, yet for some reason lua returns true when return status is 1
	if r == true then r = 1 elseif r == false then r = 0 end
	return s,r; 
end

local function jubus(_calls, arg) 
	local call_list = ""; 
	for k,v in base.pairs(_calls) do 
		if call_list ~= "" then call_list = call_list..","; end
		call_list = call_list..k; 
	end
	if arg[1] == ".methods" then 
		base.print(call_list); 
	elseif _calls[arg[1]] then 
		local params = {}; 
		if arg[2] then params = base.json.decode(arg[2]); end
		_calls[arg[1]](params); 
	else 
		io.write("Unknown method!\n"); 
	end
end

require("ubus"); 
local session = {
	access = function(sid, group, acl, rights) 
		local conn = base.ubus.connect(); 
		local result = conn:call("session", "access", { ubus_rpc_session = sid }); 
		conn:close(); 
		if(result and result.acls and result.acls[group] and result.acls[group][acl]) then
			for _,v in ipairs(result.acls[group][acl]) do
				for _,j in ipairs(rights) do
					if(j == v) then return true; end 
				end
			end
		end
		return false; 
	end,
	get = function(sid)
		local conn = base.ubus.connect(); 
		local result = conn:call("session", "access", { ubus_rpc_session = sid }); 
		conn:close(); 
		return result; 
	end
}

return {
	session = session, 
	readfile = readfile, 
	log = log, 
	shell = shell,
	query = query, 
	exec = exec, 
	ubus = jubus
}; 

