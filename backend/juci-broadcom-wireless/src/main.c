#include <rpcd/plugin.h>

static int
rpc_api_init(const struct rpc_daemon_ops *o, struct ubus_context *ctx)
{
	int rv = 0;

	cursor = uci_alloc_context();

	if (!cursor)
		return UBUS_STATUS_UNKNOWN_ERROR;

	ops = o;
	
	rv |= ubus_add_object(ctx, wps_get_ubus_object());
	rv |= ubus_add_object(ctx, wl_get_ubus_object());
	
	return rv;
}

struct rpc_plugin rpc_plugin = {
	.init = rpc_api_init
};
