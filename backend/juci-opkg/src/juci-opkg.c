/*
 * rpcd - UBUS RPC server
 *
 *   Copyright (C) 2013 Jo-Philipp Wich <jow@openwrt.org>
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

#define _GNU_SOURCE /* crypt() */

#include <fcntl.h>
#include <errno.h>
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <sys/wait.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <sys/statvfs.h>
#include <dirent.h>
#include <arpa/inet.h>
#include <signal.h>
#include <glob.h>
#include <libubox/blobmsg_json.h>
#include <libubox/avl-cmp.h>
#include <libubus.h>
#include <uci.h>
#include <shadow.h>

#include <rpcd/plugin.h>

#define RPC_SHARE_DIRECTORY "/usr/share/rpcd/"

static const struct rpc_daemon_ops *ops;

static struct blob_buf buf;
static struct uci_context *cursor;

enum {
	RPC_D_DATA,
	__RPC_D_MAX
};

static const struct blobmsg_policy rpc_data_policy[__RPC_D_MAX] = {
	[RPC_D_DATA]   = { .name = "data",  .type = BLOBMSG_TYPE_STRING },
};

enum {
	RPC_OM_LIMIT,
	RPC_OM_OFFSET,
	RPC_OM_PATTERN,
	__RPC_OM_MAX
};

static const struct blobmsg_policy rpc_opkg_match_policy[__RPC_OM_MAX] = {
	[RPC_OM_LIMIT]    = { .name = "limit",    .type = BLOBMSG_TYPE_INT32  },
	[RPC_OM_OFFSET]   = { .name = "offset",   .type = BLOBMSG_TYPE_INT32  },
	[RPC_OM_PATTERN]  = { .name = "pattern",  .type = BLOBMSG_TYPE_STRING },
};

enum {
	RPC_OP_PACKAGE,
	__RPC_OP_MAX
};

static const struct blobmsg_policy rpc_opkg_package_policy[__RPC_OP_MAX] = {
	[RPC_OP_PACKAGE]  = { .name = "package",  .type = BLOBMSG_TYPE_STRING },
};

enum {
	RPC_UPGRADE_KEEP,
	RPC_UPGRADE_PATH,
	__RPC_UPGRADE_MAX
};

static int
rpc_errno_status(void)
{
	switch (errno)
	{
	case EACCES:
		return UBUS_STATUS_PERMISSION_DENIED;

	case ENOTDIR:
		return UBUS_STATUS_INVALID_ARGUMENT;

	case ENOENT:
		return UBUS_STATUS_NOT_FOUND;

	case EINVAL:
		return UBUS_STATUS_INVALID_ARGUMENT;

	default:
		return UBUS_STATUS_UNKNOWN_ERROR;
	}
}


struct opkg_state {
	int cur_offset;
	int cur_count;
	int req_offset;
	int req_count;
	int total;
	bool open;
	void *array;
};

static int
opkg_parse_list(struct blob_buf *blob, char *buf, int len, void *priv)
{
	struct opkg_state *s = priv;

	char *ptr, *last;
	char *nl = strchr(buf, '\n');
	char *name = NULL, *vers = NULL, *desc = NULL;
	void *c;

	if (!nl)
		return 0;

	s->total++;

	if (s->cur_offset++ < s->req_offset)
		goto skip;

	if (s->cur_count++ >= s->req_count)
		goto skip;

	if (!s->open)
	{
		s->open  = true;
		s->array = blobmsg_open_array(blob, "packages");
	}

	for (ptr = buf, last = buf, *nl = 0; ptr <= nl; ptr++)
	{
		if (!*ptr || (*ptr == ' ' && *(ptr+1) == '-' && *(ptr+2) == ' '))
		{
			if (!name)
			{
				name = last;
				last = ptr + 3;
				*ptr = 0;
				ptr += 2;
			}
			else if (!vers)
			{
				vers = last;
				desc = *ptr ? (ptr + 3) : NULL;
				*ptr = 0;
				break;
			}
		}
	}

	if (name && vers)
	{
		c = blobmsg_open_array(blob, NULL);

		blobmsg_add_string(blob, NULL, name);
		blobmsg_add_string(blob, NULL, vers);

		if (desc && *desc)
			blobmsg_add_string(blob, NULL, desc);

		blobmsg_close_array(blob, c);
	}

skip:
	return (nl - buf + 1);
}

static int
opkg_finish_list(struct blob_buf *blob, int status, void *priv)
{
	struct opkg_state *s = priv;

	if (!s->open)
		return UBUS_STATUS_NO_DATA;

	blobmsg_close_array(blob, s->array);
	blobmsg_add_u32(blob, "total", s->total);

	return UBUS_STATUS_OK;
}

static int
opkg_exec_list(const char *action, struct blob_attr *msg,
               struct ubus_context *ctx, struct ubus_request_data *req)
{
	struct opkg_state *state = NULL;
	struct blob_attr *tb[__RPC_OM_MAX];
	const char *cmd[5] = { "opkg", action, "-nocase", NULL, NULL };

	blobmsg_parse(rpc_opkg_match_policy, __RPC_OM_MAX, tb,
	              blob_data(msg), blob_len(msg));

	state = malloc(sizeof(*state));

	if (!state)
		return UBUS_STATUS_UNKNOWN_ERROR;

	memset(state, 0, sizeof(*state));

	if (tb[RPC_OM_PATTERN])
		cmd[3] = blobmsg_data(tb[RPC_OM_PATTERN]);

	if (tb[RPC_OM_LIMIT])
		state->req_count = blobmsg_get_u32(tb[RPC_OM_LIMIT]);

	if (tb[RPC_OM_OFFSET])
		state->req_offset = blobmsg_get_u32(tb[RPC_OM_OFFSET]);

	if (state->req_offset < 0)
		state->req_offset = 0;

	if (state->req_count <= 0 || state->req_count > 100)
		state->req_count = 100;

	return ops->exec(cmd, NULL, opkg_parse_list, NULL, opkg_finish_list,
	                 state, ctx, req);
}


static int
rpc_juci_opkg_list(struct ubus_context *ctx, struct ubus_object *obj,
                    struct ubus_request_data *req, const char *method,
                    struct blob_attr *msg)
{
	return opkg_exec_list("list", msg, ctx, req);
}

static int
rpc_juci_opkg_list_installed(struct ubus_context *ctx, struct ubus_object *obj,
                              struct ubus_request_data *req, const char *method,
                              struct blob_attr *msg)
{
	return opkg_exec_list("list-installed", msg, ctx, req);
}

rpc_juci_opkg_list_upgradable(struct ubus_context *ctx, struct ubus_object *obj,
                              struct ubus_request_data *req, const char *method,
                              struct blob_attr *msg)
{
	return opkg_exec_list("list-upgradable", msg, ctx, req);
}

static int
rpc_juci_opkg_find(struct ubus_context *ctx, struct ubus_object *obj,
                    struct ubus_request_data *req, const char *method,
                    struct blob_attr *msg)
{
	return opkg_exec_list("find", msg, ctx, req);
}

static int
rpc_juci_opkg_update(struct ubus_context *ctx, struct ubus_object *obj,
                      struct ubus_request_data *req, const char *method,
                      struct blob_attr *msg)
{
	const char *cmd[3] = { "opkg", "update", NULL };
	return ops->exec(cmd, NULL, NULL, NULL, NULL, NULL, ctx, req);
}

static int
rpc_juci_opkg_install(struct ubus_context *ctx, struct ubus_object *obj,
                       struct ubus_request_data *req, const char *method,
                       struct blob_attr *msg)
{
	struct blob_attr *tb[__RPC_OP_MAX];
	const char *cmd[5] = { "opkg", "--force-overwrite",
	                       "install", NULL, NULL };

	blobmsg_parse(rpc_opkg_package_policy, __RPC_OP_MAX, tb,
	              blob_data(msg), blob_len(msg));

	if (!tb[RPC_OP_PACKAGE])
		return UBUS_STATUS_INVALID_ARGUMENT;

	cmd[3] = blobmsg_data(tb[RPC_OP_PACKAGE]);

	return ops->exec(cmd, NULL, NULL, NULL, NULL, NULL, ctx, req);
}

static int
rpc_juci_opkg_remove(struct ubus_context *ctx, struct ubus_object *obj,
                      struct ubus_request_data *req, const char *method,
                      struct blob_attr *msg)
{
	struct blob_attr *tb[__RPC_OP_MAX];
	const char *cmd[5] = { "opkg", "--force-removal-of-dependent-packages",
	                       "remove", NULL, NULL };

	blobmsg_parse(rpc_opkg_package_policy, __RPC_OP_MAX, tb,
	              blob_data(msg), blob_len(msg));

	if (!tb[RPC_OP_PACKAGE])
		return UBUS_STATUS_INVALID_ARGUMENT;

	cmd[3] = blobmsg_data(tb[RPC_OP_PACKAGE]);

	return ops->exec(cmd, NULL, NULL, NULL, NULL, NULL, ctx, req);
}

static int
rpc_juci_opkg_config_get(struct ubus_context *ctx, struct ubus_object *obj,
                          struct ubus_request_data *req, const char *method,
                          struct blob_attr *msg)
{
	FILE *f;
	char conf[2048] = { 0 };

	if (!(f = fopen("/etc/opkg.conf", "r")))
		return rpc_errno_status();

	fread(conf, sizeof(conf) - 1, 1, f);
	fclose(f);

	blob_buf_init(&buf, 0);
	blobmsg_add_string(&buf, "config", conf);

	ubus_send_reply(ctx, req, buf.head);
	return 0;
}

static int
rpc_juci_opkg_config_set(struct ubus_context *ctx, struct ubus_object *obj,
                          struct ubus_request_data *req, const char *method,
                          struct blob_attr *msg)
{
	FILE *f;
	struct blob_attr *tb[__RPC_D_MAX];

	blobmsg_parse(rpc_data_policy, __RPC_D_MAX, tb,
	              blob_data(msg), blob_len(msg));

	if (!tb[RPC_D_DATA])
		return UBUS_STATUS_INVALID_ARGUMENT;

	if (blobmsg_data_len(tb[RPC_D_DATA]) >= 2048)
		return UBUS_STATUS_NOT_SUPPORTED;

	if (!(f = fopen("/etc/opkg.conf", "w")))
		return rpc_errno_status();

	fwrite(blobmsg_data(tb[RPC_D_DATA]),
	       blobmsg_data_len(tb[RPC_D_DATA]) - 1, 1, f);

	fclose(f);
	return 0;
}

static int rpc_api_init(const struct rpc_daemon_ops *o, struct ubus_context *ctx)
{
	int rv = 0;

	static const struct ubus_method juci_opkg_methods[] = {
		UBUS_METHOD("list",                  rpc_juci_opkg_list,
		                                     rpc_opkg_match_policy),
		UBUS_METHOD("list_installed",        rpc_juci_opkg_list_installed,
		                                     rpc_opkg_match_policy),
		UBUS_METHOD("list_upgradable",        rpc_juci_opkg_list_upgradable,
		                                     rpc_opkg_match_policy),
		UBUS_METHOD("find",                  rpc_juci_opkg_find,
		                                     rpc_opkg_match_policy),
		UBUS_METHOD("install",               rpc_juci_opkg_install,
		                                     rpc_opkg_package_policy),
		UBUS_METHOD("remove",                rpc_juci_opkg_remove,
		                                     rpc_opkg_package_policy),
		UBUS_METHOD_NOARG("update",          rpc_juci_opkg_update),
		UBUS_METHOD_NOARG("config_get",      rpc_juci_opkg_config_get),
		UBUS_METHOD("config_set",            rpc_juci_opkg_config_set,
		                                     rpc_data_policy)
	};

	static struct ubus_object_type juci_opkg_type =
		UBUS_OBJECT_TYPE("juci-opkg-type", juci_opkg_methods);

	static struct ubus_object opkg_obj = {
		.name = "juci.opkg",
		.type = &juci_opkg_type,
		.methods = juci_opkg_methods,
		.n_methods = ARRAY_SIZE(juci_opkg_methods),
	};
	
	cursor = uci_alloc_context();

	if (!cursor)
		return UBUS_STATUS_UNKNOWN_ERROR;

	ops = o;

	rv |= ubus_add_object(ctx, &opkg_obj);

	return rv;
}

struct rpc_plugin rpc_plugin = {
	.init = rpc_api_init
};
