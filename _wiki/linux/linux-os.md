---
layout  : wiki
title   : LINUX
summary : 
date    : 2024-09-07 18:54:32 +0900
updated : 2024-09-07 20:15:24 +0900
tag     : linux
toc     : true
comment : true
public  : true
parent  : [[/linux]]
latex   : true
---
* TOC
{:toc}
 
# LINUX

___[Linux](https://en.wikipedia.org/wiki/Linux)___ is an operating system kernel that provides memory management, file system abstraction, basic networking, and other essential services to an operation system.

The fact that the operating system is ___free of cost___ and also ___freely-modifiable___ adds tremendous value.

## Philosophy

__[Philosophy](https://web.archive.org/web/20161005114243/http://cyborginstitute.org/projects/administration/unix-fundamentals/#unix-philosophy)__:
- __Do one thing well__
- __Simplicity__ - Simplicity makes systems and code easier to use, extend, modify, and maintain.

## Kernel

__The operating system must fulfill two main objectives__:
- Interact with the hardware components, servicing all low-level programmable elements included in the hardware platform
- Provide an execution environment to the applications that run on the computer system (the so-called user programs).

Unix-like operating system hides all low-level details concerning the physical organization of the computer from applications run by the user.
When a program wants to use a hardware resource, it must issue a request to the operating system.

This mechanism ___enforced___.

The hardware introduces at least two different _execution modes_ for the CPU: a non-privileged mode for user programs and a privileged mode for the kernel.
Unix calls these ___USER MODE___ and ___KERNEL MODE___, respectively.

___[KERNEL](https://baekjungho.github.io/wiki/operatingsystem/os-kernel/)___ is At the heart of the operating system. ___An intermediary between hardware and software___.

## Links

- [Fundamental Systems Administration Tools and Skills](https://web.archive.org/web/20161005175531/http://cyborginstitute.org/projects/administration/fundamentals/)

## References

- Understanding the LINUX KERNEL / Daniel P.Bovet & Marco Cesati