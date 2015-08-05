#include <rpcd/plugin.h>

const struct rpc_daemon_ops *ops;

struct blob_buf bb;
struct uci_context *uci_ctx;

static int
rpc_api_init(const struct rpc_daemon_ops *o, struct ubus_context *ctx)
{
	int rv = 0;

	uci_ctx = uci_alloc_context();

	if (!ctx)
		return UBUS_STATUS_UNKNOWN_ERROR;

	ops = o;
	
	rv |= wl_init(ctx); 
	rv |= ubus_add_object(ctx, wps_get_ubus_object());
	
	return rv;
}

struct rpc_plugin rpc_plugin = {
	.init = rpc_api_init
};
