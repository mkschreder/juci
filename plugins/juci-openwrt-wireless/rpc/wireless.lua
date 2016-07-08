#!/usr/bin/lua

-- JUCI Lua Backend Server API
-- Copyright (c) 2016 Martin Schröder <mkschreder.uk@gmail.com>. All rights reserved. 
-- This module is distributed under GNU GPLv3 with additional permission for signed images.
-- See LICENSE file for more details. 


-- wlan0     ESSID: "OpenWrt"
--          Access Point: 00:23:6A:BE:F6:22
--          Mode: Master  Channel: 11 (2.462 GHz)
--          Tx-Power: 1496 dBm  Link Quality: unknown/70
--          Signal: unknown  Noise: unknown
--          Bit Rate: unknown
--          Encryption: WPA2 PSK (CCMP)
--          Type: nl80211  HW Mode(s): 802.11bgn
--          Hardware: 14E4:AA52 14E4:AA52 [Generic MAC80211]
--          TX power offset: unknown
--          Frequency offset: unknown
--          Supports VAPs: yes  PHY name: phy0

local juci = require("juci/core"); 
local iwinfo = require("iwinfo"); 
local ubus = require("juci/ubus"); 

--require("iwinfo"); 
--require("ubus"); 

local function wireless_get_80211_device_names()
	-- this will get list of devices that support phy80211 interface. 
	local output = juci.shell("find /sys/class/net/**/*phy80211* 2> /dev/null | awk 'BEGIN{FS=\"/\"} { print $5 }'"); 
	local devices = {}; 
	for wldev in output:gmatch("[^\r\n]+") do   
		table.insert(devices, wldev); 
	end
	return devices; 
end

local function wireless_get_80211_devices()
	local devices = wireless_get_80211_device_names(); 
	local result = { devices = {} }; 
	for _,wldev in ipairs(devices) do 
		local iw = iwinfo[iwinfo.type(wldev)];
		-- prevent devices that are not ready (do not have ssid) from appearing in the list!
		if(iw and iw.ssid(wldev)) then 
			table.insert(result.devices, {
				device = wldev, 
				ssid = iw.ssid(wldev), 
				bssid = iw.bssid(wldev),
				type = iwinfo.type(wldev), 
				hwmodes = iw.hwmodelist(wldev), 
				mode = iw.mode(wldev), 
				channel = iw.channel(wldev), 
				frequency = iw.frequency(wldev), 
				txpower = iw.txpower(wldev),
				quality = iw.quality(wldev), 
				quality_max = iw.quality(wldev),
				signal = iw.signal(wldev),
				noise = iw.noise(wldev),
				bitrate = iw.bitrate(wldev),
				encryption = iw.encryption(wldev),
				mbssid_support = iw.mbssid_support(wldev),
				--txpwrlist = iw.txpwrlist(wldev),
				--freqlist = iw.freqlist(wldev),
				country = iw.country(wldev)
				--countrylist = iw.countrylist(wldev)
			}); 
		end
	end
	return result.devices; 
end

local function wireless_get_80211_countrylist(wldev)
	local iw = iwinfo[iwinfo.type(wldev)];
	if(iw) then 
		return iw.countrylist(wldev); 
	end
	return {}; 
end

local function wireless_get_80211_htmodelist(wldev)
	local iw = iwinfo[iwinfo.type(wldev)];
	if(iw) then 
		return iw.htmodelist(wldev); 
	end
	return {}; 
end

local function wireless_get_80211_freqlist(wldev)
	local iw = iwinfo[iwinfo.type(wldev)];
	if(iw) then 
		return iw.freqlist(wldev); 
	end
	return {}; 
end

local function wireless_get_80211_txpowerlist(wldev)
	local iw = iwinfo[iwinfo.type(wldev)];
	if(iw) then 
		return iw.txpwrlist(wldev); 
	end
	return {}; 
end

local function wireless_get_80211_caps()
	local devices = wireless_get_80211_device_names(); 
	local result = { devices = {} }; 
	for _,wldev in ipairs(devices) do 
		local iw = iwinfo[iwinfo.type(wldev)];
		if(iw) then 
			table.insert(result.devices, {
				device = wldev, 
				txpwrlist = iw.txpwrlist(wldev),
				freqlist = iw.freqlist(wldev),
				country = iw.country(wldev),
				countrylist = iw.countrylist(wldev)
			}); 
		end
	end
	return result.devices; 
end 

local function wireless_get_extended_stainfo(wldev, macaddr)
	-- run the iw station get and parse output. It's output is basically a ":" separated key value list, but the keys contain spaces. 
	-- so what we do is we strip the spaces and convert the list to a proper key value list using awk
	local stdout = juci.shell("iw dev %s station get %s 2> /dev/null | tail -n +2 | awk 'BEGIN{FS=\":\"}{gsub(/^[ \\t]+/, \"\", $2); gsub(/^[ \\t]+/,\"\", $1); gsub(/\\//, \"_\", $1); gsub(/ /, \"_\", $1);  gsub(/ .*/, \"\", $2); print tolower($1) \" \" $2}'", wldev, macaddr); 
	local info = {}; 
	-- then we parse one line at a time
	for line in stdout:gmatch("[^\r\n]+") do 
		-- and get our key value pairs that have been prepared for us
		local key,val = line:match("(%S+)%s+(%S+)"); 
		-- next we convert all numbers from string to digits and convert yes/no to true/false
		local num = tonumber(val); 
		-- discard float part (TODO: this will basically chop of all decimals on numbers so we can use it on ubus (ubus does not support floats). We may want to multiply by a factor. But this will require checking for sideeffects in the frontend!).
		if num ~= nil then 
			-- multiply by 1000000 to get value in bps (data is in mbs) Note: remember to divide in frontend if mbs is required!
			if key == "tx_bitrate" or key == "rx_bitrate" then num = num * 1000000; end
			val = math.floor(num); 
		end 
		if val == "yes" then val = true; elseif val == "no" then val = false; end
		info[key] = val; 
	end
	return info; 
end

local function wireless_devices()
	local result = {}; 
	result.devices = wireless_get_80211_devices(); 
	return result; 
end

local function wireless_get_caps()
	local result = {}; 
	result.caps = wireless_get_80211_caps();
	return result; 
end

local function wireless_radios()
	return {}; 
end

local function wireless_countrylist(msg)
	local result = {}; 
	if(not msg.device) then
		return { error = "no device specified!" }; 
	end
	print("getting countrylist for "..msg.device); 
	result.countries = wireless_get_80211_countrylist(msg.device); 
	return result; 
end

local function wireless_htmodelist(msg)
	local result = {}
	if(not msg.device) then
		return { error = "no device specified!" }; 
	end
	result.htmodes = wireless_get_80211_htmodelist(msg.device); 
	return result; 
end

local function wireless_freqlist(msg)
	local result = {}
	if(not msg.device) then
		return { error = "no device specified!" }; 
	end
	result.channels = wireless_get_80211_freqlist(msg.device); 
	return result; 
end

local function wireless_txpowerlist(msg)
	local result = {}
	if(not msg.device) then
		return { error = "no device specified!" }; 
	end
	result.txpowerlist = wireless_get_80211_txpowerlist(msg.device); 
	return result; 
end


local function wireless_clients()
	local devices = wireless_get_80211_device_names(); 
	local result = { clients = {} }; 
	for _,wldev in ipairs(devices) do
		local t = iwinfo.type(wldev); 
		if t and iwinfo[t] then 
			result.clients[wldev] = iwinfo[t].assoclist(wldev); 
		end
	end
	return result; 
end 

return {
	devices = wireless_devices,
	caps = wireless_get_caps,
	radios = wireless_radios, 
	clients = wireless_clients,
	countrylist = wireless_countrylist,
	htmodelist = wireless_htmodelist,
	freqlist = wireless_freqlist,
	txpowerlist = wireless_txpowerlist
}; 
