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

/* limit of log size buffer */
#define RPC_JUCI_MAX_LOGSIZE		(128 * 1024)
#define RPC_JUCI_DEF_LOGSIZE       (16 * 1024)

/* location of menu definitions */

#define RPC_JUCI_MENU_FILES        RPC_SHARE_DIRECTORY "menu.d/*.json"
#define RPC_SESSION_ACL_DIR RPC_SHARE_DIRECTORY "acl.d/"


static const struct rpc_daemon_ops *ops;

static struct blob_buf buf;
static struct uci_context *cursor;

enum {
	RPC_S_PID,
	RPC_S_SIGNAL,
	__RPC_S_MAX,
};

static const struct blobmsg_policy rpc_signal_policy[__RPC_S_MAX] = {
	[RPC_S_PID]    = { .name = "pid",    .type = BLOBMSG_TYPE_INT32 },
	[RPC_S_SIGNAL] = { .name = "signal", .type = BLOBMSG_TYPE_INT32 },
};

enum {
	RPC_I_NAME,
	RPC_I_ACTION,
	__RPC_I_MAX,
};

static const struct blobmsg_policy rpc_init_policy[__RPC_I_MAX] = {
	[RPC_I_NAME]   = { .name = "name",   .type = BLOBMSG_TYPE_STRING },
	[RPC_I_ACTION] = { .name = "action", .type = BLOBMSG_TYPE_STRING },
};

enum {
	RPC_D_DATA,
	__RPC_D_MAX
};

static const struct blobmsg_policy rpc_data_policy[__RPC_D_MAX] = {
	[RPC_D_DATA]   = { .name = "data",  .type = BLOBMSG_TYPE_STRING },
};

enum {
	RPC_BACKUP_PASSWORD,
	__RPC_BACKUP_MAX
};

static const struct blobmsg_policy rpc_backup_policy[__RPC_BACKUP_MAX] = {
	[RPC_BACKUP_PASSWORD]   = { .name = "password",  .type = BLOBMSG_TYPE_STRING },
};

enum {
	RPC_K_KEYS,
	__RPC_K_MAX
};

static const struct blobmsg_policy rpc_sshkey_policy[__RPC_K_MAX] = {
	[RPC_K_KEYS]   = { .name = "keys",   .type = BLOBMSG_TYPE_ARRAY },
};

enum {
	RPC_P_USER,
	RPC_P_PASSWORD,
	RPC_P_CURPASSWORD,
	__RPC_P_MAX
};

static const struct blobmsg_policy rpc_password_policy[__RPC_P_MAX] = {
	[RPC_P_USER]     = { .name = "user",     .type = BLOBMSG_TYPE_STRING },
	[RPC_P_PASSWORD] = { .name = "password", .type = BLOBMSG_TYPE_STRING },
	[RPC_P_CURPASSWORD] = { .name = "curpass", .type = BLOBMSG_TYPE_STRING }
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

enum {
	RPC_MENU_SESSION,
	__RPC_MENU_MAX
};

static const struct blobmsg_policy rpc_menu_policy[__RPC_MENU_MAX] = {
	[RPC_MENU_SESSION] = { .name = "ubus_rpc_session",
	                                          .type = BLOBMSG_TYPE_STRING },
};

enum {
	RPC_SWITCH_NAME,
	__RPC_SWITCH_MAX
};

static const struct blobmsg_policy rpc_switch_policy[__RPC_SWITCH_MAX] = {
	[RPC_SWITCH_NAME]  = { .name = "switch",  .type = BLOBMSG_TYPE_STRING },
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
rpc_juci_backup_restore(struct ubus_context *ctx, struct ubus_object *obj,
                         struct ubus_request_data *req, const char *method,
                         struct blob_attr *msg)
{
	struct blob_attr *tb[__RPC_BACKUP_MAX];
	
	blobmsg_parse(rpc_backup_policy, __RPC_BACKUP_MAX, tb,
	              blob_data(msg), blob_len(msg));
	
	struct blob_attr *pass = tb[RPC_BACKUP_PASSWORD]; 
	
	if (pass && blobmsg_data_len(pass) > 0 && blobmsg_data(pass) && strlen(blobmsg_data(pass)) > 0){
		const char *cmd[] = { "sysupgrade", "--restore-backup",
	                       "/tmp/backup.tar.gz", "--password", blobmsg_data(pass), NULL };

		return ops->exec(cmd, NULL, NULL, NULL, NULL, NULL, ctx, req);
	} 
	
	const char *cmd[] = { "sysupgrade", "--restore-backup",
						   "/tmp/backup.tar.gz", NULL };

	return ops->exec(cmd, NULL, NULL, NULL, NULL, NULL, ctx, req);
}

static int
rpc_juci_backup_clean(struct ubus_context *ctx, struct ubus_object *obj,
                       struct ubus_request_data *req, const char *method,
                       struct blob_attr *msg)
{
	if (unlink("/tmp/backup.tar.gz"))
		return rpc_errno_status();

	return 0;
}

static int
rpc_juci_backup_config_get(struct ubus_context *ctx, struct ubus_object *obj,
                            struct ubus_request_data *req, const char *method,
                            struct blob_attr *msg)
{
	FILE *f;
	char conf[2048] = { 0 };

	if (!(f = fopen("/etc/sysupgrade.conf", "r")))
		return rpc_errno_status();

	fread(conf, sizeof(conf) - 1, 1, f);
	fclose(f);

	blob_buf_init(&buf, 0);
	blobmsg_add_string(&buf, "config", conf);

	ubus_send_reply(ctx, req, buf.head);
	return 0;
}

static int
rpc_juci_backup_config_set(struct ubus_context *ctx, struct ubus_object *obj,
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

	if (!(f = fopen("/etc/sysupgrade.conf", "w")))
		return rpc_errno_status();

	fwrite(blobmsg_data(tb[RPC_D_DATA]),
	       blobmsg_data_len(tb[RPC_D_DATA]) - 1, 1, f);

	fclose(f);
	return 0;
}

struct backup_state {
	bool open;
	void *array;
};

static int
backup_parse_list(struct blob_buf *blob, char *buf, int len, void *priv)
{
	struct backup_state *s = priv;
	char *nl = strchr(buf, '\n');

	if (!nl)
		return 0;

	if (!s->open)
	{
		s->open  = true;
		s->array = blobmsg_open_array(blob, "files");
	}

	*nl = 0;
	blobmsg_add_string(blob, NULL, buf);

	return (nl - buf + 1);
}

static int
backup_finish_list(struct blob_buf *blob, int status, void *priv)
{
	struct backup_state *s = priv;

	if (!s->open)
		return UBUS_STATUS_NO_DATA;

	blobmsg_close_array(blob, s->array);

	return UBUS_STATUS_OK;
}


static int
rpc_juci_backup_list(struct ubus_context *ctx, struct ubus_object *obj,
                      struct ubus_request_data *req, const char *method,
                      struct blob_attr *msg)
{
	struct backup_state *state = NULL;
	const char *cmd[3] = { "sysupgrade", "--list-backup", NULL };

	state = malloc(sizeof(*state));

	if (!state)
		return UBUS_STATUS_UNKNOWN_ERROR;

	memset(state, 0, sizeof(*state));

	return ops->exec(cmd, NULL, backup_parse_list, NULL, backup_finish_list,
	                 state, ctx, req);
}

/*
static int
rpc_juci_reset_start(struct ubus_context *ctx, struct ubus_object *obj,
                      struct ubus_request_data *req, const char *method,
                      struct blob_attr *msg)
{
	switch (fork())
	{
	case -1:
		return rpc_errno_status();

	case 0:
		uloop_done();

		chdir("/");

		close(0);
		close(1);
		close(2);

		sleep(1);

		//execl("/sbin/mtd", "/sbin/mtd", "-r", "erase", "rootfs_data", NULL);
		execl("/sbin/defaultreset", "/sbin/defaultreset", NULL, NULL);

		return rpc_errno_status();

	default:
		return 0;
	}
}

static int
rpc_juci_reboot(struct ubus_context *ctx, struct ubus_object *obj,
                 struct ubus_request_data *req, const char *method,
                 struct blob_attr *msg)
{
	switch (fork())
	{
	case -1:
		return rpc_errno_status();

	case 0:
		chdir("/");

		close(0);
		close(1);
		close(2);

		sleep(1);

		execl("/sbin/reboot", "/sbin/reboot", NULL);

		return rpc_errno_status();

	default:
		return 0;
	}
}
*/

static bool
menu_access(struct blob_attr *sid, struct blob_attr *acls, struct blob_buf *e)
{
	int rem;
	struct blob_attr *acl;
	bool rv = true;
	void *c;

	c = blobmsg_open_table(e, "write");

	blobmsg_for_each_attr(acl, acls, rem)
	{
		if (!ops->session_access(blobmsg_data(sid), "access-group",
		                         blobmsg_data(acl), "read"))
		{
			rv = false;
			break;
		}

		blobmsg_add_u8(e, blobmsg_data(acl),
		               ops->session_access(blobmsg_data(sid), "access-group",
		                                   blobmsg_data(acl), "write"));
	}

	blobmsg_close_table(e, c);

	return rv;
}

static bool
menu_files(struct blob_attr *files)
{
	int rem;
	bool empty = true;
	struct stat s;
	struct blob_attr *file;

	blobmsg_for_each_attr(file, files, rem)
	{
		empty = false;

		if (blobmsg_type(file) != BLOBMSG_TYPE_STRING)
			continue;

		if (stat(blobmsg_get_string(file), &s) || !S_ISREG(s.st_mode))
			continue;

		return true;
	}

	return empty;
}

static int
rpc_juci_ui_menu(struct ubus_context *ctx, struct ubus_object *obj,
                  struct ubus_request_data *req, const char *method,
                  struct blob_attr *msg)
{
	int i, rem, rem2;
	glob_t gl;
	struct blob_buf menu = { 0 };
	struct blob_buf item = { 0 };
	struct blob_attr *entry, *attr;
	struct blob_attr *tb[__RPC_MENU_MAX];
	bool access, files;
	void *c, *d;

	blobmsg_parse(rpc_menu_policy, __RPC_MENU_MAX, tb,
	              blob_data(msg), blob_len(msg));

	if (!tb[RPC_MENU_SESSION])
		return UBUS_STATUS_INVALID_ARGUMENT;


	blob_buf_init(&buf, 0);
	c = blobmsg_open_table(&buf, "menu");

	if (!glob(RPC_JUCI_MENU_FILES, 0, NULL, &gl))
	{
		for (i = 0; i < gl.gl_pathc; i++)
		{
			blob_buf_init(&menu, 0);

			if (!blobmsg_add_json_from_file(&menu, gl.gl_pathv[i]))
				goto skip;

			blob_for_each_attr(entry, menu.head, rem)
			{
				access = files = true;

				blob_buf_init(&item, 0);
				d = blobmsg_open_table(&item, blobmsg_name(entry));

				blobmsg_for_each_attr(attr, entry, rem2)
				{
					if (blob_id(attr) == BLOBMSG_TYPE_ARRAY &&
					    !strcmp(blobmsg_name(attr), "acls"))
						access = menu_access(tb[RPC_MENU_SESSION], attr, &item);
					else if (blob_id(attr) == BLOBMSG_TYPE_ARRAY &&
					         !strcmp(blobmsg_name(attr), "files"))
						files = menu_files(attr);
					else
						blobmsg_add_blob(&item, attr);
				}

				blobmsg_close_table(&item, d);

				if (access && files)
					blob_for_each_attr(attr, item.head, rem2)
						blobmsg_add_blob(&buf, attr);

				blob_buf_free(&item);
			}

skip:
			blob_buf_free(&menu);
		}

		globfree(&gl);
	}

	blobmsg_close_table(&buf, c);

	ubus_send_reply(ctx, req, buf.head);
	return 0;
}


static void
parse_acl_file(struct blob_buf *acls, const char *path)
{
	struct blob_buf acl = { 0 };
	struct blob_attr *cur;
	void *c;
	int rem;

	blob_buf_init(&acl, 0);

	if (blobmsg_add_json_from_file(&acl, path))
	{
		c = blobmsg_open_table(acls, NULL);

		blob_for_each_attr(cur, acl.head, rem)
			blobmsg_add_blob(acls, cur);

		blobmsg_close_table(acls, c);
	}

	blob_buf_free(&acl);
}

static int
rpc_juci_ui_acls(struct ubus_context *ctx, struct ubus_object *obj,
                  struct ubus_request_data *req, const char *method,
                  struct blob_attr *msg)
{
	int i;
	void *c;
	glob_t gl;

	if (glob(RPC_SESSION_ACL_DIR "/*.json", 0, NULL, &gl))
		return rpc_errno_status();

	blob_buf_init(&buf, 0);
	c = blobmsg_open_array(&buf, "acls");

	for (i = 0; i < gl.gl_pathc; i++)
		parse_acl_file(&buf, gl.gl_pathv[i]);

	globfree(&gl);
	blobmsg_close_array(&buf, c);

	ubus_send_reply(ctx, req, buf.head);
	return 0;
}

static void receive_event(struct ubus_context *ctx, struct ubus_event_handler *ev,
			  const char *type, struct blob_attr *msg)
{
	char *str;

	str = blobmsg_format_json(msg, true);
	FILE *logfile = fopen("/var/run/ubus.events", "a"); 
	if(logfile){
		fprintf(logfile, "{ \"time\": %d, \"type\": \"%s\", \"data\": %s }\n", time(NULL), type, str);
		fclose(logfile); 
	}
	free(str);
}

static int rpc_juci_system_events(struct ubus_context *ctx, struct ubus_object *obj,
		  struct ubus_request_data *req, const char *method,
		  struct blob_attr *msg)
{
	blob_buf_init(&buf, 0);
	char line[512] = {0}; 
	
	void *arr = blobmsg_open_array(&buf, "events"); 
	FILE *logfile = fopen("/var/run/ubus.events", "r"); 
	if(logfile){
		while(fgets(line, sizeof(line), logfile)){
			void *obj = blobmsg_open_table(&buf, NULL); 
			blobmsg_add_json_from_string(&buf, line);
			blobmsg_close_table(&buf, obj);  
		}
		// possible race? 
		system("tail -n20 /var/run/ubus.events > /tmp/ubus.events; mv /tmp/ubus.events /var/run/ubus.events"); 
	}
	blobmsg_close_array(&buf, arr); 
	
	ubus_send_reply(ctx, req, buf.head);

	return 0;
}

static void init_ubus_event_listener(struct ubus_context *ctx){
	static struct ubus_event_handler listener;
	const char *event;
	int ret = 0;

	memset(&listener, 0, sizeof(listener));
	listener.cb = receive_event;
	
	ubus_register_event_handler(ctx, &listener, "*"); 
}

static void 
remove_newline(char *buf)
{
	int len;
	len = strlen(buf) - 1;
	if (buf[len] == '\n') 
		buf[len] = 0;
}

static const char*
run_command(const char *pFmt, int *exit_code, ...)
{
	va_list ap;
	char cmd[256] = {0};
	
	
	va_start(ap, pFmt);
	vsnprintf(cmd, sizeof(cmd), pFmt, ap);
	va_end(ap);

	FILE *pipe = 0;
	static char buffer[16384] = {0};
	memset(buffer, 0, sizeof(buffer)); 
	
	if ((pipe = popen(cmd, "r"))){
		char *ptr = buffer; 
		size_t size = 0; 
		while(size = fgets(ptr, sizeof(buffer) - (ptr - buffer), pipe)){
			ptr+=size; 
			//*ptr = '\0'; 
		}
		
		*exit_code = WEXITSTATUS(pclose(pipe));

		remove_newline(buffer);
		if (ptr != buffer)
			return (const char*)buffer;
		else
			return "{}";
	} else {
		return "{}"; 
	}
}

static int
rpc_juci_api_init(const struct rpc_daemon_ops *o, struct ubus_context *ctx)
{
	int rv = 0;
	static const struct ubus_method juci_ui_methods[] = {
		UBUS_METHOD("menu",            rpc_juci_ui_menu, rpc_menu_policy),
		UBUS_METHOD_NOARG("acls",            rpc_juci_ui_acls)
	};

	static struct ubus_object_type juci_ui_type =
		UBUS_OBJECT_TYPE("luci-rpc-juci-ui", juci_ui_methods);

	static struct ubus_object ui_obj = {
		.name = "juci.ui",
		.type = &juci_ui_type,
		.methods = juci_ui_methods,
		.n_methods = ARRAY_SIZE(juci_ui_methods),
	};

	static const struct ubus_method juci_events_methods[] = {
		UBUS_METHOD_NOARG("list",            rpc_juci_system_events)
	};

	static struct ubus_object_type juci_events_type =
		UBUS_OBJECT_TYPE("luci-rpc-juci-events", juci_events_methods);

	static struct ubus_object events_obj = {
		.name = "juci.events",
		.type = &juci_events_type,
		.methods = juci_events_methods,
		.n_methods = ARRAY_SIZE(juci_events_methods),
	};
	
	cursor = uci_alloc_context();

	if (!cursor)
		return UBUS_STATUS_UNKNOWN_ERROR;

	ops = o;

	//rv |= ubus_add_object(ctx, &system_obj);
	rv |= ubus_add_object(ctx, &ui_obj);
	rv |= ubus_add_object(ctx, &events_obj);
	
	init_ubus_event_listener(ctx); 
	
	return rv;
}

struct rpc_plugin rpc_plugin = {
	.init = rpc_juci_api_init
};
