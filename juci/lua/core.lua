local table = require("table"); 
local string = require("string"); 
local io = require("io"); 
local json = require("juci/json"); 
local posix = require("posix.unistd"); 
local sys = require("posix.sys.wait");
local stdio = require("posix.stdio");

local base = _G

--module("juci"); 

function readfile(name)
	local f = base.assert(io.open(name, "r")); 
	local s = f:read("*a"); 
	s = s:gsub("\n+$", "");  -- remove trailing new line
	f:close(); 
	return s; 
end

function log(source, msg)
	local fd = io.open("/dev/console", "w"); 
	fd:write((source or "juci")..": "..(msg or "").."\n"); 
	fd:close();
end

function exec(cmd, args)
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

	local ret = sys.wait(child)
	return ret, stdout, strerr; 
end

function shell(fmt, ...)
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

function ubus(_calls, arg) 
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

return {
	readfile = readfile, 
	log = log, 
	shell = shell, 
	exec = exec, 
	ubus = ubus
}; 

