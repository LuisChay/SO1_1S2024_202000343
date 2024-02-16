#include <linux/module.h>
#define INCLUDE_VERMAGIC
#include <linux/build-salt.h>
#include <linux/elfnote-lto.h>
#include <linux/vermagic.h>
#include <linux/compiler.h>

BUILD_SALT;
BUILD_LTO_INFO;

MODULE_INFO(vermagic, VERMAGIC_STRING);
MODULE_INFO(name, KBUILD_MODNAME);

__visible struct module __this_module
__section(".gnu.linkonce.this_module") = {
	.name = KBUILD_MODNAME,
	.init = init_module,
#ifdef CONFIG_MODULE_UNLOAD
	.exit = cleanup_module,
#endif
	.arch = MODULE_ARCH_INIT,
};

#ifdef CONFIG_RETPOLINE
MODULE_INFO(retpoline, "Y");
#endif

static const struct modversion_info ____versions[]
__used __section("__versions") = {
	{ 0x32e21920, "module_layout" },
	{ 0xd62ca47, "seq_read" },
	{ 0x26cf5fb, "remove_proc_entry" },
	{ 0x92997ed8, "_printk" },
	{ 0x4a3c27d2, "proc_create" },
	{ 0xd0da656b, "__stack_chk_fail" },
	{ 0x29126269, "seq_printf" },
	{ 0x40c7247c, "si_meminfo" },
	{ 0x5b8239ca, "__x86_return_thunk" },
	{ 0x1e973f7e, "single_open" },
	{ 0xbdfb6dbb, "__fentry__" },
};

MODULE_INFO(depends, "");


MODULE_INFO(srcversion, "E763C2CD6E65F772DF8C4B8");
