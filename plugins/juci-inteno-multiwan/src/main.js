
UCI.$registerConfig("multiwan"); 
UCI.multiwan.$registerSectionType("multiwan", { // config
	"enabled": 					{ dvalue: true, type: Boolean }, 
	"default_route": 		{ dvalue: "balancer", type: String }, 
	"health_monitor": 	{ dvalue: "", type: String }, 
	"debug":						{ dvalue: false, type: Boolean }
}); 

UCI.multiwan.$registerSectionType("interface", { // config
	"weight": 							{ dvalue: 10, type: Number }, 
	"health_interval": 			{ dvalue: 10, type: Number }, 
	"icmp_hosts": 					{ dvalue: "dns", type: String }, 
	"icmp_count": 					{ dvalue: 3, type: Number }, 
	"timeout":							{ dvalue: 3, type: Number },
	"health_fail_retries":	{ dvalue: 3, type: Number },
	"health_recovery_retries":{ dvalue: 5, type: Number },
	"failover_to":					{ dvalue: "", type: String },
	"dns":									{ dvalue: "auto", type: String }
}); 

UCI.multiwan.$registerSectionType("mwanfw", { // config
	"src": 									{ dvalue: "", type: String }, 
	"dst": 									{ dvalue: "", type: String }, 
	"proto": 								{ dvalue: "", type: String }, 
	"ports": 								{ dvalue: "", type: String }, 
	"wanrule": 							{ dvalue: "", type: String }
}); 

