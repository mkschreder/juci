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

#include "questd.h"
#include "igmp.h"

#define MAX_IGMP_ENTRY 128

int igmp_rpc(struct ubus_context *ctx, struct ubus_object *obj,
	struct ubus_request_data *req, const char *method,
	struct blob_attr *msg);


typedef struct igmp_table {
	bool exists;
	char bridge[32];
	char device[32];
	char srcdev[32];
	char tags[32];
	int lantci;
	int wantci;
	int group;
	char mode[32];
	int RxGroup;
	int source;
	int reporter;
	int timeout;
	int Index;
	int ExcludPt;
}IGMPtable;

char* convert_to_ipaddr(int ip)
{
	struct in_addr ip_addr;
	ip_addr.s_addr = ip;
	return inet_ntoa(ip_addr);
}

char* single_space(char* str){
	char *from, *to;
	int space = 0;
	from = to = str;
	while(1) {
		if(space && *from == ' ' && to[-1] == ' ') {
			++from;
		} else {
			space = (*from == ' ') ? 1 : 0;
			*to++ = *from++;
			if(!to[-1])
				break;
		}
	}
	return str;
}

int igmp_rpc(struct ubus_context *ctx, struct ubus_object *obj,
		struct ubus_request_data *req, const char *method,
		struct blob_attr *msg) {

	struct blob_buf bb;
	IGMPtable table[MAX_IGMP_ENTRY];
	FILE *snptable;
	char line[256];
	int idx = 0;
	void *t, *a;

	if ((snptable = fopen("/proc/net/igmp_snooping", "r"))) {
		while(fgets(line, sizeof(line), snptable) != NULL)
		{
			remove_newline(line);
			table[idx].exists = false;
			if(sscanf(single_space(line),"%s %s %s %s %x %x %x %s %x %x %x %d %x %d",
					table[idx].bridge, table[idx].device, table[idx].srcdev, table[idx].tags, &(table[idx].lantci), &(table[idx].wantci),
					&(table[idx].group), table[idx].mode, &(table[idx].RxGroup), &(table[idx].source), &(table[idx].reporter),
					&(table[idx].timeout), &(table[idx].Index), &(table[idx].ExcludPt)) == 14)
			{
				table[idx].exists = true;
				idx++;
			}
		}
		fclose(snptable);
	} else
		return UBUS_STATUS_NOT_FOUND;

	blob_buf_init(&bb, 0);

	a = blobmsg_open_array(&bb, "table");
	for (idx = 0; idx < MAX_IGMP_ENTRY; idx++) {
		if (!table[idx].exists)
			break;
		t = blobmsg_open_table(&bb, NULL);
		blobmsg_add_string(&bb,"bridge", table[idx].bridge);
		blobmsg_add_string(&bb,"device", table[idx].device);
		blobmsg_add_string(&bb,"srcdev", table[idx].srcdev);
		blobmsg_add_string(&bb,"tags", table[idx].tags);
		blobmsg_add_u32(&bb,"lantci", table[idx].lantci);
		blobmsg_add_u32(&bb,"wantci", table[idx].wantci);
		blobmsg_add_string(&bb,"group", convert_to_ipaddr(table[idx].group));
		blobmsg_add_string(&bb,"mode", table[idx].mode);
		blobmsg_add_string(&bb,"rxgroup", convert_to_ipaddr(table[idx].RxGroup));
		blobmsg_add_string(&bb,"source", convert_to_ipaddr(table[idx].source));
		blobmsg_add_string(&bb,"reporter", convert_to_ipaddr(table[idx].reporter));
		blobmsg_add_u32(&bb,"timeout", table[idx].timeout);
		blobmsg_add_u32(&bb,"index", table[idx].Index);
		blobmsg_add_u32(&bb,"excludpt", table[idx].ExcludPt);
		blobmsg_close_table(&bb, t);
	}
	blobmsg_close_array(&bb, a);

	ubus_send_reply(ctx, req, bb.head);

	return 0;
}

static int rpc_api_init(const struct rpc_daemon_ops *o, struct ubus_context *ctx)
{
	int rv = 0;

	static const struct ubus_method juci_iptv_methods[] = {
		UBUS_METHOD("igmptable",             	igmp_rpc
	};

	static struct ubus_object_type juci_iptv_type =
		UBUS_OBJECT_TYPE("juci-iptv-type", juci_iptv_methods);

	static struct ubus_object iptv_obj = {
		.name = "juci.iptv",
		.type = &juci_iptv_type,
		.methods = juci_iptv_methods,
		.n_methods = ARRAY_SIZE(juci_iptv_methods),
	};
	
	cursor = uci_alloc_context();

	if (!cursor)
		return UBUS_STATUS_UNKNOWN_ERROR;

	ops = o;

	rv |= ubus_add_object(ctx, &iptv_obj);

	return rv;
}

struct rpc_plugin rpc_plugin = {
	.init = rpc_api_init
};

