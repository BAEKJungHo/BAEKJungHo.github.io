---
layout  : wiki
title   : System Call
summary : 
date    : 2023-11-12 15:02:32 +0900
updated : 2023-11-12 15:12:24 +0900
tag     : operatingsystem
toc     : true
comment : true
public  : true
parent  : [[/operatingsystem]]
latex   : true
---
* TOC
{:toc}

## System Call

__[Kernel](https://baekjungho.github.io/wiki/operatingsystem/os-kernel/)__ 

CPU 에는 UserMode 와 KernelMode 가 존재한다.

The purpose of the system calls is to allow user-level applications access of the services provided by the kernel. The user apps do not have the privelege to perform operations, so they make system calls which further requests a kernel to provide a specific service.

프로그램은 컴퓨터에 대한 전체 액세스 권한을 신뢰할 수 없기 때문에 UserMode 에서 실행된다. UserMode 는 해당 작업을 수행하여 대부분의 컴퓨터에 대한 액세스를 방지한다.
하지만 프로그램은 I/O 에 액세스하고, 메모리를 할당하고, 어떻게든 운영 체제와 상호 작용할 수 있어야 한다. 이를 위해 UserMode 에서 실행되는 소프트웨어는 운영 체제 Kernel 에 도움을 요청해야 한다.

User space to kernel space control transfers are accomplished using a processor feature called [software interrupts](https://en.wikipedia.org/wiki/Interrupt#Software_interrupts).

이때, __system call__ 을 통해서 OS 에 도움을 요청하게 된다.

### Wrapper APIs: Abstracting Away Interrupts

__[Different Types of System Calls in OS](https://www.geeksforgeeks.org/different-types-of-system-calls-in-os/)__:

![](/resource/wiki/os-system-call/types-of-system-call.png)

C 언어에서 Unix 와 유사한 시스템에서 exit(1)을 호출하면 해당 함수는 내부적으로 올바른 레지스터/스택/기타에 시스템 호출의 옵코드와 인수를 배치한 후 인터럽트를 트리거하는 기계 코드를 실행한다.

## Hardware Interrupts

![](/resource/wiki/os-system-call/hardware-interrupts.png)

OS schedulers use timer chips like PITs to trigger hardware interrupts for multitasking:

- Before jumping to program code, the OS sets the timer chip to trigger an interrupt after some period of time.
- The OS switches to user mode and jumps to the next instruction of the program.
- When the timer elapses, it triggers a hardware interrupt to switch to kernel mode and jump to OS code.
- The OS can now save where the program left off, load a different program, and repeat the process.

This is called preemptive multitasking; the interruption of a process is called preemption. If you’re, say, reading this article on a browser and listening to music on the same machine, your very own computer is probably following this exact cycle thousands of times a second.

## References

- [CPU Land](https://cpu.land/the-basics)