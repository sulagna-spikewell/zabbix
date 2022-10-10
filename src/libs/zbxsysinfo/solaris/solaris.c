/*
** Zabbix
** Copyright (C) 2001-2022 Zabbix SIA
**
** This program is free software; you can redistribute it and/or modify
** it under the terms of the GNU General Public License as published by
** the Free Software Foundation; either version 2 of the License, or
** (at your option) any later version.
**
** This program is distributed in the hope that it will be useful,
** but WITHOUT ANY WARRANTY; without even the implied warranty of
** MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
** GNU General Public License for more details.
**
** You should have received a copy of the GNU General Public License
** along with this program; if not, write to the Free Software
** Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
**/

#include "zbxsysinfo.h"

ZBX_METRIC	parameters_specific[] =
/*	KEY			FLAG		FUNCTION		TEST PARAMETERS */
{
	{"kernel.maxproc",	0,		kernel_maxproc,	NULL},

	{"vfs.fs.size",		CF_HAVEPARAMS,	VFS_FS_SIZE,		"/,free"},
	{"vfs.fs.inode",	CF_HAVEPARAMS,	VFS_FS_INODE,		"/,free"},
	{"vfs.fs.discovery",	0,		VFS_FS_DISCOVERY,	NULL},
	{"vfs.fs.get",		0,		VFS_FS_GET,		NULL},

	{"vfs.dev.read",	CF_HAVEPARAMS,	vfs_dev_read,		"sd0,operations"},
	{"vfs.dev.write",	CF_HAVEPARAMS,	vfs_dev_write,		"sd0,operations"},

	{"net.tcp.listen",	CF_HAVEPARAMS,	net_tcp_listen,		"80"},
	{"net.udp.listen",	CF_HAVEPARAMS,	net_udp_listen,		"68"},

	{"net.if.in",		CF_HAVEPARAMS,	net_if_in,		"hme0,bytes"},
	{"net.if.out",		CF_HAVEPARAMS,	net_if_out,		"hme0,bytes"},
	{"net.if.total",	CF_HAVEPARAMS,	net_if_total,		"hme0,bytes"},
	{"net.if.collisions",	CF_HAVEPARAMS,	net_if_collisions,	"hme0"},
	{"net.if.discovery",	0,		net_if_discovery,	NULL},

	{"vm.memory.size",	CF_HAVEPARAMS,	VM_MEMORY_SIZE,		"free"},

	{"proc.cpu.util",	CF_HAVEPARAMS,	proc_cpu_util,		"inetd"},
	{"proc.num",		CF_HAVEPARAMS,	proc_num,		"inetd"},
	{"proc.mem",		CF_HAVEPARAMS,	proc_mem,		"inetd"},

	{"system.cpu.switches",	0,		system_cpu_switches,	NULL},
	{"system.cpu.intr",	0,		system_cpu_intr,	NULL},
	{"system.cpu.util",	CF_HAVEPARAMS,	system_cpu_util,	"all,idle"},
	{"system.cpu.load",	CF_HAVEPARAMS,	system_cpu_load,	"all,avg1"},
	{"system.cpu.num",	CF_HAVEPARAMS,	system_cpu_num,		"online"},
	{"system.cpu.discovery",0,		system_cpu_discovery,	NULL},

	{"system.uname",	0,		system_uname,		NULL},

	{"system.swap.size",	CF_HAVEPARAMS,	system_swap_size,	"all,free"},
	{"system.swap.in",	CF_HAVEPARAMS,	system_swap_in,		"all"},
	{"system.swap.out",	CF_HAVEPARAMS,	system_swap_out,	"all,count"},

	{"system.uptime",	0,		system_uptime,		NULL},
	{"system.boottime",	0,		system_boottime,	NULL},
	{"system.sw.arch",	0,		system_sw_arch,		NULL},

	{NULL}
};
