//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

UCI.$registerConfig("qos");
UCI.qos.$registerSectionType("classify", {
	"target":	{ dvalue:'Normal', type: String },
	"ports":	{ dvalue: '', type: String },
	"comment":	{ dvalue: '', type: String },
	"dscp":		{ dvalue: '', type: String },
	"srchost":	{ dvalue: '', type: String, validator: UCI.validators.IPAddressValidator },
	"dsthost":	{ dvalue: '', type: String, validator: UCI.validators.IPAddressValidator },
	"proto":	{ dvalue: '', type: String }
});
UCI.qos.$registerSectionType("classgroup", {
	"classes":	{ dvalue: 'Priority Express Normal Bulk', type: String },
	"default": 	{ dvalue: 'Normal', type: String }
});

JUCI.app.factory("intenoQos", function($uci){
	function Qos(){ }
	Qos.prototype.getDefaultTargets = function(){
		var def = $.Deferred(); 
		$uci.$sync(["qos"]).done(function(){
			var targets = []; 
			if($uci.qos.Default){
				targets = $uci.qos.Default.classes.value.split(" ").map(function(x){
					//if(x == "Bulk") return { label: $tr(gettext("Low")), value: x };
					return x; 
				});
			}
			def.resolve(targets); 
		}).fail(function(){ def.reject(); });
		return def.promise(); 
	} 

	return new Qos(); 
}); 
