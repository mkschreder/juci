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

static const struct rpc_daemon_ops *ops;

static struct blob_buf buf;
static struct uci_context *cursor;

enum {
	RPC_UPGRADE_KEEP,
	RPC_UPGRADE_PATH,
	__RPC_UPGRADE_MAX
};

static const struct blobmsg_policy rpc_upgrade_policy[__RPC_UPGRADE_MAX] = {
	[RPC_UPGRADE_KEEP] = { .name = "keep",    .type = BLOBMSG_TYPE_INT32 },
	[RPC_UPGRADE_PATH] = { .name = "path",    .type = BLOBMSG_TYPE_STRING },
};

enum {
	RPC_UPGRADE_CHECK,
	__RPC_UPG_CHECK_MAX
};

static const struct blobmsg_policy rpc_upgrade_check_policy[__RPC_UPG_CHECK_MAX] = {
	[RPC_UPGRADE_CHECK] = { .name = "type",    .type = BLOBMSG_TYPE_STRING },
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

static int
rpc_juci_upgrade_check(struct ubus_context *ctx, struct ubus_object *obj,
                       struct ubus_request_data *req, const char *method,
                       struct blob_attr *msg)
{
	const char *type = "--usb";

	struct blob_attr *tb[__RPC_UPG_CHECK_MAX];
	blobmsg_parse(rpc_upgrade_check_policy, __RPC_UPG_CHECK_MAX, tb, blob_data(msg), blob_len(msg));

	if (tb[RPC_UPGRADE_CHECK] && !strcmp(blobmsg_data(tb[RPC_UPGRADE_CHECK]), "online"))
		type = "--online";

	const char *cmd[3] = { "sysupgrade", type, NULL };
	return ops->exec(cmd, NULL, NULL, NULL, NULL, NULL, ctx, req);
}

static int
rpc_juci_upgrade_test(struct ubus_context *ctx, struct ubus_object *obj,
                       struct ubus_request_data *req, const char *method,
                       struct blob_attr *msg)
{
	const char *cmd[4] = { "sysupgrade", "--test", "/tmp/firmware.bin", NULL };
	return ops->exec(cmd, NULL, NULL, NULL, NULL, NULL, ctx, req);
}

static int
rpc_juci_upgrade_start(struct ubus_context *ctx, struct ubus_object *obj,
                        struct ubus_request_data *req, const char *method,
                        struct blob_attr *msg)
{
	char fwpath[255];
	const char *keep = "-q";
	strcpy(fwpath, "/tmp/firmware.bin");

	struct blob_attr *tb[__RPC_UPGRADE_MAX];
	blobmsg_parse(rpc_upgrade_policy, __RPC_UPGRADE_MAX, tb, blob_data(msg), blob_len(msg));

	if (tb[RPC_UPGRADE_PATH] && strlen(blobmsg_data(tb[RPC_UPGRADE_PATH]))) {
		strncpy(fwpath, blobmsg_data(tb[RPC_UPGRADE_PATH]), sizeof(fwpath));
	}

	if (tb[RPC_UPGRADE_KEEP] && !blobmsg_get_u32(tb[RPC_UPGRADE_KEEP]))
		keep = "-n";
	
	const char *cmd[4] = { "sysupgrade", keep, fwpath, NULL };
	return ops->exec(cmd, NULL, NULL, NULL, NULL, NULL, ctx, req);
}

static int
rpc_juci_upgrade_clean(struct ubus_context *ctx, struct ubus_object *obj,
                        struct ubus_request_data *req, const char *method,
                        struct blob_attr *msg)
{
	if (unlink("/tmp/firmware.bin"))
		return rpc_errno_status();

	return 0;
}

static int
rpc_api_init(const struct rpc_daemon_ops *o, struct ubus_context *ctx)
{
	int rv = 0;

	static const struct ubus_method juci_system_methods[] = {
		UBUS_METHOD(				"check",	  rpc_juci_upgrade_check, rpc_upgrade_check_policy),
		UBUS_METHOD_NOARG(	"test", rpc_juci_upgrade_test),
		UBUS_METHOD(				"start",      rpc_juci_upgrade_start, rpc_upgrade_policy),
		UBUS_METHOD_NOARG(	"clean",rpc_juci_upgrade_clean)
	};

	static struct ubus_object_type juci_system_type =
		UBUS_OBJECT_TYPE("luci-rpc-juci-system", juci_system_methods);

	static struct ubus_object system_obj = {
		.name = "juci.system",
		.type = &juci_system_type,
		.methods = juci_system_methods,
		.n_methods = ARRAY_SIZE(juci_system_methods),
	};

	cursor = uci_alloc_context();

	if (!cursor)
		return UBUS_STATUS_UNKNOWN_ERROR;

	ops = o;

	rv |= ubus_add_object(ctx, &system_obj);

	return rv;
}

struct rpc_plugin rpc_plugin = {
	.init = rpc_api_init
};
