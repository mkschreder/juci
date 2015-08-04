/*
 * Copyright (C) 2012-2013 Inteno Broadband Technology AB. All rights reserved.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA
 */

#include <libubox/blobmsg_json.h>
#include <libubox/avl-cmp.h>
#include <libubus.h>
#include <uci.h>
#include <arpa/inet.h>
#include <rpcd/plugin.h>

static const struct rpc_daemon_ops *ops;

static struct blob_buf buf;
static struct uci_context *cursor;

static const struct blobmsg_policy rpc_macarg_policy[1] = {
	[0]   = { .name = "mac",   .type = BLOBMSG_TYPE_STRING }
};


void 
remove_newline(char *buf)
{
	int len;
	len = strlen(buf) - 1;
	if (buf[len] == '\n') 
		buf[len] = 0;
}

int rpc_macdb_lookup(struct ubus_context *ctx, struct ubus_object *obj,
		struct ubus_request_data *req, const char *method,
		struct blob_attr *msg) {
	
	static struct blob_buf bb;
	void *t, *a;
	FILE *pipe; 
	struct blob_attr *tb[1];
	char cmd[255] = {0}; 
	char line[255] = {0}; 
	
	blobmsg_parse(rpc_macarg_policy, 1, tb,
	              blob_data(msg), blob_len(msg));

	if (!tb[0])
		return UBUS_STATUS_INVALID_ARGUMENT;
	
	const char *macaddr = blobmsg_get_string(tb[0]); 
	
	snprintf(cmd, sizeof(cmd), "maclookup %s", macaddr); 
	
	if (!(pipe = popen(cmd, "r"))) {
		return UBUS_STATUS_NOT_FOUND;
	}
	
	while(fgets(line, sizeof(line), pipe) != NULL){
		break; 
	}
	
	pclose(pipe);
	
	blob_buf_init(&bb, 0);
	
	remove_newline(line); 
	
	if(strlen(line) > 0)
		blobmsg_add_string(&bb,"vendor", line);

	ubus_send_reply(ctx, req, bb.head);

	return 0;
}

static int rpc_api_init(const struct rpc_daemon_ops *o, struct ubus_context *ctx)
{
	int rv = 0;

	static const struct ubus_method juci_macdb_methods[] = {
		UBUS_METHOD("lookup",		rpc_macdb_lookup, 	rpc_macarg_policy)
	};

	static struct ubus_object_type juci_macdb_type =
		UBUS_OBJECT_TYPE("juci-macdb-type", juci_macdb_methods);

	static struct ubus_object macdb_obj = {
		.name = "juci.macdb",
		.type = &juci_macdb_type,
		.methods = juci_macdb_methods,
		.n_methods = ARRAY_SIZE(juci_macdb_methods),
	};
	
	cursor = uci_alloc_context();

	if (!cursor)
		return UBUS_STATUS_UNKNOWN_ERROR;

	ops = o;

	rv |= ubus_add_object(ctx, &macdb_obj);

	return rv;
}

struct rpc_plugin rpc_plugin = {
	.init = rpc_api_init
};

