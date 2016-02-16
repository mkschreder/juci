#!/usr/bin/lua

local ubus = require("juci/ubus"); 

return ubus.bind("system", { "board", "info" });  
