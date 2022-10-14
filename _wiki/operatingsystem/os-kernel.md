---
layout  : wiki
title   : Kernels - at the heart of the operating system
summary : 운영체제의 핵심인 커널
date    : 2022-10-10 15:02:32 +0900
updated : 2022-10-10 15:12:24 +0900
tag     : operatingsystem
toc     : true
comment : true
public  : true
parent  : [[/operatingsystem]]
latex   : true
---
* TOC
{:toc}

## Kernel

> ![](/resource/wiki/os-kernel/kernel-architecture.png)
> 
> Image showing Fundamental Architecture of Linux

- 소프트웨어와 하드웨어 사이의 __인터페이스__ 역할을 함
- 소프트웨어와 하드웨어 사이에서 상호작용을 하며 __자원을 가능한한 효율적으로 관리__ 한다.
  - 커널은 장치 드라이버를 통해서 모든 하드웨어 리소스(Ex. I/O, 메모리, 암호화 등)를 제어하고 이러한 리소스와 관련된 프로세스 간의 충돌을 중재하며, CPU 및 캐시 사용, 파일 시스템 및 네트워크 소켓과 같은 공통 리소스의 활용을 최적화 한다.

The kernel is the heart of the operating system and controls all the important functions of hardware – this is the case for Linux, macOS and Windows, smartphones, servers, and virtualizations like KVM as well as every other type of computer.

## Structure of a kernel: 5 Layers

A kernel is always built the same way and consists of several layers:

- Layer 5: The highest layer is the File system. That’s where processes are assigned to RAM or the hard drive.
  - __Communication with Software__
- Layer 4: Device management.
- Layer 3: Process management (scheduler). Which is responsible for time management and makes multitasking possible.
- Layer 2: Memory management. Which entails distributing RAM including the virtual main memory.
- Layer 1: The deepest layer is the interface with hardware (processors, memory, and devices). Which manages network controllers and PCI express controllers.
  - Lowest layer is machine oriented. __It can communicate directly with the hardware, processor, and memory.__

## The four functions of the kernel

- __Memory management__: Regulates how much memory is used in different places.
- __Process management__: Determines which processes the CPU can use, as well as when and how long they’re used for.
- __Device driver__: Intermediates between hardware and processes.
- __System calls and security__: Receives service requests from the processes.

## The kernel in the operating system

- __Hardware_: The foundation of the system, made up of RAM, the processor and input and output devices. The CPU carries out reading and writing operations and calculations for the memory.
- __Kernel__: The nucleus of the operating system in contact with the CPU.
- __User processes__: All running processes that the kernel manages. The kernel makes communication between processes and servers possible, also known as Inter-Process Communication (IPC).

## The kernel modes

- __Kernel Mode__: Access to the hardware. 
- __User Mode__: [Areas accessible to users](https://github.com/NKLCWDT/cs/blob/main/Operating%20System/Stack_Heap.md#%EC%9C%A0%EC%A0%80-%EC%98%81%EC%97%AD). (Ex. Code, Data, Stack, Heap Area in Process)
  - In User mode, the executing code has no ability to directly access hardware or reference memory.
  - Code running in user mode must delegate to system APIs to access hardware or memory.
  - __Due to the protection afforded by this sort of isolation, crashes in user mode are always recoverable.__

### Switching between User Mode and Kernel Mode

The transition from user mode to kernel mode occurs when the application requests the help of operating system or an interrupt or a system call occurs.

![](/resource/wiki/os-kernel/switching.png)

The mode bit is set to 0 in the kernel mode. It is changed from 0 to 1 when switching from kernel mode to user mode.

## Links

- [What is a kernel - Digital Guide](https://www.ionos.com/digitalguide/server/know-how/what-is-a-kernel/)
- [System call operating system - guru99](https://www.guru99.com/system-call-operating-system.html)
- [Kernel (operating system) - Wikipedia](https://en.wikipedia.org/wiki/Kernel_(operating_system))
- [User Mode vs Kernel Mode](https://www.tutorialspoint.com/User-Mode-vs-Kernel-Mode#:~:text=The%20transition%20from%20user%20mode%20to%20kernel%20mode,when%20switching%20from%20user%20mode%20to%20kernel%20mode.)
- [Understanding User and Kernel Mode](https://blog.codinghorror.com/understanding-user-and-kernel-mode/)
- [TryParse and the Exception Tax](https://blog.codinghorror.com/tryparse-and-the-exception-tax/)
- [Kernel Architecture Of Linux (Part 7/15)](https://www.engineersgarage.com/kernel-architecture-of-linux-part-7-15/)