#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>
#include "main.h"
#include "tools.h"

struct uci_package *
init_package(const char *config)
{
	struct uci_context *ctx = uci_ctx;
	struct uci_package *p = NULL;

	if (!ctx) {
		ctx = uci_alloc_context();
		uci_ctx = ctx;
	} else {
		p = uci_lookup_package(ctx, config);
		if (p)
			uci_unload(ctx, p);
	}

	if (uci_load(ctx, config, &p))
		return NULL;

	return p;
}

static struct uci_context *db_ctx;
static uint8_t dbLoaded = 0; 

void __attribute__((__constructor__)) init_db_hw_config(void) {
	db_ctx = uci_alloc_context();
	uci_set_confdir(db_ctx, "/lib/db/config/");
	if(uci_load(db_ctx, "hw", NULL) == UCI_OK){
		PDEBUG("broadcom.wireless: Could not load hardware config!\n"); 
		dbLoaded = 1;
	}
}

void
get_db_hw_value(char *opt, char **val)
{
	static struct uci_ptr ptr;

	memset(&ptr, 0, sizeof(ptr));
	ptr.package = "hw";
	ptr.section = "board";
	ptr.value = NULL;

	*val = "";

	if (!dbLoaded)
		return;

	ptr.option = opt;
	if (uci_lookup_ptr(db_ctx, &ptr, NULL, true) != UCI_OK)
		return;

	if (!(ptr.flags & UCI_LOOKUP_COMPLETE))
		return;

	if(!ptr.o->v.string)
		return;

	*val = ptr.o->v.string;
}


void runCmd(const char *pFmt, ...)
{
	va_list ap;
	char cmd[256] = {0};
	int len=0, maxLen;

	maxLen = sizeof(cmd);

	va_start(ap, pFmt);

	if (len < maxLen)
	{
		maxLen -= len;
		vsnprintf(&cmd[len], maxLen, pFmt, ap);
	}

	system(cmd);

	va_end(ap);
}

void 
remove_newline(char *buf)
{
	int len;
	len = strlen(buf) - 1;
	if (buf[len] == '\n') 
		buf[len] = 0;
}

const char*
chrCmd(const char *pFmt, ...)
{
	va_list ap;
	char cmd[256] = {0};
	int len=0, maxLen;

	maxLen = sizeof(cmd);

	va_start(ap, pFmt);

	if (len < maxLen)
	{
		maxLen -= len;
		vsnprintf(&cmd[len], maxLen, pFmt, ap);
	}

	va_end(ap);

	FILE *pipe = 0;
	static char buffer[4096] = {0};
	if ((pipe = popen(cmd, "r"))){
		char *ptr = buffer; 
		size_t size = 0; 
		while(size = fgets(ptr, sizeof(buffer) - (ptr - buffer), pipe)){
			ptr+=size; 
		}
		pclose(pipe);

		remove_newline(buffer);
		if (strlen(buffer))
			return (const char*)buffer;
		else
			return "";
	} else {
		return ""; 
	}
}

const char*
run_command(const char *pFmt, ...)
{
	va_list ap;
	char cmd[256] = {0};
	int len=0, maxLen;

	maxLen = sizeof(cmd);

	va_start(ap, pFmt);

	if (len < maxLen)
	{
		maxLen -= len;
		vsnprintf(&cmd[len], maxLen, pFmt, ap);
	}

	va_end(ap);

	FILE *pipe = 0;
	static char buffer[16384] = {0};
	if ((pipe = popen(cmd, "r"))){
		char *ptr = buffer; 
		size_t size = 0; 
		while(size = fgets(ptr, sizeof(buffer) - (ptr - buffer), pipe)){
			ptr+=size; 
		}
		pclose(pipe);

		remove_newline(buffer);
		if (strlen(buffer))
			return (const char*)buffer;
		else
			return "";
	} else {
		return ""; 
	}
}
