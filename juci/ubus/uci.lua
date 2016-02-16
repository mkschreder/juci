#!/usr/bin/lua

local ubus = require("juci/ubus"); 

return ubus.bind("uci", {"get","set","add","configs","commit","revert","apply","rollback","delete"}); 
