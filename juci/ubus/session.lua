#!/usr/bin/lua

local ubus = require("juci/ubus"); 

return ubus.bind("session", { "access", "login"}); 
