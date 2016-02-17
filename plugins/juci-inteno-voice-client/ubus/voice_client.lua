#!/usr/bin/lua

local juci = require("juci/core");
local PATH = "/etc/asterisk/ssl/ca.pem"

function read_ssl()
	local res = "";
	local file = io.open(PATH, "r");
	if file then 
		for line in file:lines() do 
			res = res..line;
		end;
		file:close();
	end;
	return {result=res};
end;

function write_ssl(opts)
	local data = opts.data;
	if data == nil then
		return {result="error no data"};
	end
	local file = io.open(PATH, "w+");
	file:write(data);
	file:close();
	return {result="success"};
end;

return {
	["get_trusted_ca"] = read_ssl,
	["set_trusted_ca"] = write_ssl
};
