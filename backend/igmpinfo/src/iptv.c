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

#include <stdio.h>
#include <stdlib.h>
#include <arpa/inet.h>

#define MAX_IGMP_ENTRY 128

typedef struct igmp_table {
	uint8_t exists;
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

static char* convert_to_ipaddr(int ip)
{
	struct in_addr ip_addr;
	ip_addr.s_addr = ip;
	return inet_ntoa(ip_addr);
}

static char* single_space(char* str){
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


void 
remove_newline(char *buf)
{
	int len;
	len = strlen(buf) - 1;
	if (buf[len] == '\n') 
		buf[len] = 0;
}

int main() {
	IGMPtable table[MAX_IGMP_ENTRY];
	FILE *snptable;
	char line[256];
	int idx = 0;
	void *t, *a;

	if ((snptable = fopen("/proc/net/igmp_snooping", "r"))) {
		while(fgets(line, sizeof(line), snptable) != NULL)
		{
			remove_newline(line);
			table[idx].exists = 0;
			if(sscanf(single_space(line),"%s %s %s %s %x %x %x %s %x %x %x %d %x %d",
					table[idx].bridge, table[idx].device, table[idx].srcdev, table[idx].tags, &(table[idx].lantci), &(table[idx].wantci),
					&(table[idx].group), table[idx].mode, &(table[idx].RxGroup), &(table[idx].source), &(table[idx].reporter),
					&(table[idx].timeout), &(table[idx].Index), &(table[idx].ExcludPt)) == 14)
			{
				table[idx].exists = 1;
				idx++;
			}
		}
		fclose(snptable);
	} else
		return -1;

	for (idx = 0; idx < MAX_IGMP_ENTRY; idx++) {
		if (!table[idx].exists)
			break;
		printf("%s\t%s\t%s\t%s\t%d\t%d\t%s\t%s\t%s\t%s\t%s\t%d\t%d\t%d\n", 
			table[idx].bridge, 
			table[idx].device,
			table[idx].srcdev,
			table[idx].tags,
			table[idx].lantci, 
			table[idx].wantci,
			convert_to_ipaddr(table[idx].group),
			table[idx].mode, 
			convert_to_ipaddr(table[idx].RxGroup), 
			convert_to_ipaddr(table[idx].source), 
			convert_to_ipaddr(table[idx].reporter), 
			table[idx].timeout, 
			table[idx].Index, 
			table[idx].ExcludPt
		); 
	}
	
	return 0;
}


