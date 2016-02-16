local ubus = require("juci/ubus"); 

return ubus.bind("network.interface", { "dump" }); 

