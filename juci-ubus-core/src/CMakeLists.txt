cmake_minimum_required(VERSION 2.6)

PROJECT(ubus-mod-juci C)


ADD_SUBDIRECTORY(io)

ADD_DEFINITIONS(-Os -Wall -Wno-format-y2k -W -Wstrict-prototypes -Wmissing-prototypes -Wpointer-arith -Wreturn-type -Wcast-qual -Wwrite-strings -Wswitch -Wshadow -Wcast-align -Wchar-subscripts -Winline -Wnested-externs -Wredundant-decls -Wmissing-field-initializers -Wextra -Wformat=2 -Wno-format-nonliteral -Wpointer-arith -Wno-missing-braces --std=gnu99 -g3 -Wmissing-declarations -Iinclude) 

SET(CMAKE_SHARED_LIBRARY_LINK_C_FLAGS "")

ADD_LIBRARY(ubus-mod-juci MODULE juci.c)
TARGET_LINK_LIBRARIES(ubus-mod-juci ubox ubus )
SET_TARGET_PROPERTIES(ubus-mod-juci PROPERTIES OUTPUT_NAME ubus-mod-juci PREFIX "")

INSTALL(TARGETS ubus-mod-juci LIBRARY DESTINATION lib)
