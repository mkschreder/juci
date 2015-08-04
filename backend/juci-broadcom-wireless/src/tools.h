#pragma once

#include <libubox/blobmsg_json.h>
#include <libubox/avl-cmp.h>
#include <libubus.h>
#include <uci.h>

struct uci_package *init_package(const char *config); 
void get_db_hw_value(char *opt, char **val); 
void runCmd(const char *pFmt, ...); 
void remove_newline(char *buf); 
const char* chrCmd(const char *pFmt, ...); 

#ifndef PDEBUG
#define PDEBUG(...) printf(__VA_ARGS__)
#endif
