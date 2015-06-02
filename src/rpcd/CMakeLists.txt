cmake_minimum_required(VERSION 2.6)

PROJECT(luciexpress-plugin C)

ADD_DEFINITIONS(-Os -Wall -Wno-format-y2k -W -Wstrict-prototypes -Wmissing-prototypes -Wpointer-arith -Wreturn-type -Wcast-qual -Wwrite-strings -Wswitch -Wshadow -Wcast-align -Wchar-subscripts -Winline -Wnested-externs -Wredundant-decls -Wmissing-field-initializers -Wextra -Wformat=2 -Wno-format-nonliteral -Wpointer-arith -Wno-missing-braces --std=gnu99 -g3 -Wmissing-declarations -Iinclude) 

SET(CMAKE_SHARED_LIBRARY_LINK_C_FLAGS "")

IF(APPLE)
  INCLUDE_DIRECTORIES(/opt/local/include)
  LINK_DIRECTORIES(/opt/local/lib)
ENDIF()

FIND_LIBRARY(crypt NAMES crypt)
IF(crypt STREQUAL "LIBS-NOTFOUND")
  SET(crypt "")
ENDIF()

ADD_LIBRARY(luciexpress-plugin MODULE luci2.c)
TARGET_LINK_LIBRARIES(luciexpress-plugin ubox ubus ${crypt})
SET_TARGET_PROPERTIES(luciexpress-plugin PROPERTIES OUTPUT_NAME luciexpress PREFIX "")

ADD_LIBRARY(bwmon-plugin MODULE bwmon.c)
SET_TARGET_PROPERTIES(bwmon-plugin PROPERTIES OUTPUT_NAME bwmon PREFIX "")

INSTALL(TARGETS luciexpress-plugin bwmon-plugin LIBRARY DESTINATION lib)
