## Process this file with automake to produce Makefile.in

bin_PROGRAMS = zabbix_get

zabbix_get_SOURCES = \
	zabbix_get.c

zabbix_get_LDADD = \
	$(top_builddir)/src/libs/zbxcomms/libzbxcomms.a \
	$(top_builddir)/src/libs/zbxxml/libzbxxml.a \
	$(top_builddir)/src/libs/zbxjson/libzbxjson.a \
	$(top_builddir)/src/libs/zbxvariant/libzbxvariant.a \
	$(top_builddir)/src/libs/zbxregexp/libzbxregexp.a \
	$(top_builddir)/src/libs/zbxstr/libzbxstr.a \
	$(top_builddir)/src/libs/zbxgetopt/libzbxgetopt.a \
	$(top_builddir)/src/libs/zbxlog/libzbxlog.a \
	$(top_builddir)/src/libs/zbxcrypto/libzbxcrypto.a \
	$(top_builddir)/src/libs/zbxhash/libzbxhash.a \
	$(top_builddir)/src/libs/zbxthreads/libzbxthreads.a \
	$(top_builddir)/src/libs/zbxmutexs/libzbxmutexs.a \
	$(top_builddir)/src/libs/zbxprof/libzbxprof.a \
	$(top_builddir)/src/libs/zbxalgo/libzbxalgo.a \
	$(top_builddir)/src/libs/zbxnix/libzbxnix.a \
	$(top_builddir)/src/libs/zbxcompress/libzbxcompress.a \
	$(top_builddir)/src/libs/zbxnum/libzbxnum.a \
	$(top_builddir)/src/libs/zbxip/libzbxip.a \
	$(top_builddir)/src/libs/zbxtime/libzbxtime.a \
	$(top_builddir)/src/libs/zbxcommon/libzbxcommon.a \
	$(top_builddir)/src/libs/zbxbincommon/libzbxbincommon.a \
	$(top_builddir)/src/libs/zbxagentget/libzbxagentget.a \
	$(top_builddir)/src/libs/zbxversion/libzbxversion.a \
	$(ZBXGET_LIBS)

zabbix_get_LDFLAGS = $(ZBXGET_LDFLAGS)

zabbix_get_CFLAGS = $(TLS_CFLAGS)
