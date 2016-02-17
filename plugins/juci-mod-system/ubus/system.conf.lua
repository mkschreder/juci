#!/usr/bin/lua

local juci = require("juci/core"); 

local function backup_restore(opts)
	local res = {}; 
	if(opts.pass ~= "" and opts.pass ~= nil) then 
		local decrypt = juci.shell(string.format('openssl des3 -d -in /tmp/backup.tar.gz -out /tmp/backup.tar.gz.dec -pass pass:"%s" 2>/dev/null && echo "OK"', opts.pass)); 
		if(decrypt == "OK\n") then
			juci.shell("mv /tmp/backup.tar.gz.dec /tmp/backup.tar.gz"); 
			res["stdout"] = juci.shell("sysupgrade --restore-backup /tmp/backup.tar.gz"); 
		else
			res["error"] = "Invalid Password!"; 
		end
	else
		res["stdout"] = juci.shell("sysupgrade --restore-backup /tmp/backup.tar.gz"); 
	end
	return res; 
end

local function backup_clean()
	local res = {}; 
	res["stdout"] = juci.shell("sysupgrade --clean"); 
	return res; 
end

local function backup_get_features()
	local res = { }; 
	if("" ~= juci.shell("openssl version")) then res.encryption = true; else res.encryption = false end
	res.comment = false; 
	return res; 
end

return {
	["restore"] = backup_restore, 
	["features"] = backup_get_features, 
	["clean"] = backup_clean
}; 

