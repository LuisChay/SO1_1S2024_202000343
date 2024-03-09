#include <linux/fs.h>
#include <linux/init.h>
#include <linux/kernel.h>
#include <linux/module.h>
#include <linux/seq_file.h>
#include <linux/stat.h>
#include <linux/string.h>
#include <linux/uaccess.h>
#include <linux/mm.h>
#include <linux/sysinfo.h>
#include <linux/sched/task.h>
#include <linux/sched.h>
#include <linux/proc_fs.h>
#include <asm/uaccess.h>

MODULE_LICENSE("GPL");
MODULE_DESCRIPTION("Modulo CPU -Laboratorio Sistemas Operativos 1");
MODULE_AUTHOR("Luis Chay");



static int calcularPorcentajeCpu(void)
{
    struct file *archivo;
    char lectura[256];

    int usuario, nice, system, idle, iowait, irq, softirq, steal, guest, guest_nice;
    int total;
    int porcentaje;

    archivo = filp_open("/proc/stat", O_RDONLY, 0);
    if (archivo == NULL)
    {
        printk(KERN_ALERT "Error al abrir el archivo");
        return -1;
    }

    memset(lectura, 0, 256);
    kernel_read(archivo, lectura, sizeof(lectura), &archivo->f_pos);

    sscanf(lectura, "cpu %d %d %d %d %d %d %d %d %d %d", &usuario, &nice, &system, &idle, &iowait, &irq, &softirq, &steal, &guest, &guest_nice);

    total = usuario + nice + system + idle + iowait + irq + softirq + steal + guest + guest_nice;

    porcentaje = (total - idle) * 100 / total;
    filp_close(archivo, NULL);

    return porcentaje;

}

static int escribir_archivo(struct seq_file *archivo, void *v)
{
    int porcentaje = calcularPorcentajeCpu();
    if (porcentaje == -1)
    {
        seq_printf(archivo, "Error al leer el archivo");
    }
    else
    {
        seq_printf(archivo, "{\n");
        seq_printf(archivo, "\"Porcentaje_en_uso\": %d,\n", porcentaje);
        seq_printf(archivo, "\"tasks\": [\n");
        struct task_struct* cpu_task;
        int ram, separador = 0;
        for_each_process(cpu_task)
        {
            if (separador){
                seq_printf(archivo, ",\n");
            }
            seq_printf(archivo, "{\n");
            seq_printf(archivo, "\"pid\": %d,\n", cpu_task->pid);
            seq_printf(archivo, "\"nombre\": \"%s\",\n", cpu_task->comm);
            seq_printf(archivo, "\"usuario\": %d,\n", cpu_task->cred->uid.val);
            seq_printf(archivo, "\"estado\": %d,\n", cpu_task->__state);
            if (cpu_task->mm)
            {
                ram = (get_mm_rss(cpu_task->mm)<<PAGE_SHIFT)/(1024*1024); // MB
                seq_printf(archivo, "\"ram\": %d,\n", ram);
            }
            seq_printf(archivo, "\"padre\": %d\n", cpu_task->parent->pid);
            seq_printf(archivo, "}\n");
            separador = 1;
            
        }
        seq_printf(archivo, "]\n");
        seq_printf(archivo, "}\n");
    }
    return 0;
}

//Funcion que se ejecuta cuando se le hace un cat al modulo.
static int al_abrir(struct inode *inode, struct file *file)
{
    return single_open(file, escribir_archivo, NULL);
}

// Si el su Kernel es 5.6 o mayor
static struct proc_ops operaciones =
{
    .proc_open = al_abrir,
    .proc_read = seq_read
};

static int _insert(void)
{
    proc_create("cpu_so1_1s2024", 0, NULL, &operaciones);
    printk(KERN_INFO "Creacion modulo\n");
    return 0;
}

static void _remove(void)
{
    remove_proc_entry("cpu_so1_1s2024", NULL);
    printk(KERN_INFO "Eliminacion modulo\n");
}

module_init(_insert);
module_exit(_remove);
