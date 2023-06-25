---
layout  : wiki
title   : Linux Memory Allocation and Overcommit Concepts
summary : 
date    : 2023-06-21 11:28:32 +0900
updated : 2023-06-21 12:15:24 +0900
tag     : linux oom kubernetes
toc     : true
comment : true
public  : true
parent  : [[/linux]]
latex   : true
---
* TOC
{:toc}

## How to Check Memory Usage Per Process on Linux

Original. [How to Check Memory Usage Per Process on Linux](https://linuxhint.com/check_memory_usage_process_linux/)

Every process allocates some amount of RAM or memory for itself. It is essential for the process to function correctly.
If a process fails to allocate enough RAM or memory, then the process can’t be created and the program won’t be able to start.

__Checking Memory Usage Using ps Command:__

```
$ ps -o pid,user,%mem,command ax | sort -b -k3 -r
```

__Checking Memory Usage of Processes with pmap:__

```
$ sudo pmap 917(PID)
```

If you don’t care about how much memory the libraries or other dependent files are using, then run pmap as follows:

```
// total memory used by the process (KB)
$ sudo pmap 917 | tail -n 1
```

## Various Memory

Original. [Process Memory Management in Linux](https://www.baeldung.com/linux/process-memory-management#rss-memory)

__RSS Memory:__

RSS(Resident Set Size) Memory is a measurement that shows how much RAM has been allocated to a process during its execution.
하지만, 메모리에 로드된 라이브러리를 고려하지 않기 때문에 실제로는 프로세스의 RAM 사용량에 대한 정확한 측정이 아니다.

## Linux Memory Allocation

Linux 에서는 __프로세스가 메모리를 요청할 때, 해당 메모리에 대한 가상 주소 공간을 할당__ 한다. 그리고 가상 주소 공간이 실제 물리 메모리와 매핑하는 과정을 페이징이라고한다.

> 페이징에서는 가상 주소 공간을 고정 크기의 작은 조각인 페이지(page)로 분할하고, 실제 물리 메모리도 동일한 크기의 페이지로 나눈다. 가상 주소 공간의 각 페이지는 페이지 테이블(page table)에 의해 실제 물리 메모리의 어떤 페이지와 매핑되는지 정보를 가지고 있다.
>
> 프로세스가 메모리에 접근할 때, 가상 주소가 페이지 단위로 분할되고, 해당 페이지가 현재 메모리에 존재하지 않으면 페이지 폴트(page fault)가 발생한다. 페이지 폴트는 운영 체제에게 해당 페이지를 실제 메모리에 로드하도록 요청하고, 페이지 테이블을 업데이트하여 가상 주소와 실제 메모리 주소 간의 매핑을 수행한다.

Linux 는 요청된 메모리의 총량이 실제 운영 체제가 가진 물리 메모리의 총량보다 많더라도 실제로 메모리가 부족해지기 전까지는 프로그램의 실행을 허용한다. 즉, __물리 메모리 할당을 효율적으로 관리하기 위해서 Linux 의 메모리 관리 방식은 프로세스가 필요한 메모리를 실제로 사용할 때까지는 실제 물리 메모리를 할당하지 않는다.__ 이렇게 동적으로 할당하는 이유는 프로세스가 메모리를 요청하고 실제로는 사용하지 않을 수도 있기 때문이다.

## Commit and Overcommit

The sar command in Linux is used to collect, report, or save system activity information. It provides statistical data related to various aspects of system performance such as CPU usage, memory utilization, disk I/O, network activity, and more. By analyzing this data, administrators can monitor system performance, identify bottlenecks, and troubleshoot issues.

프로세스가 가상메모리를 할당받은상태를 __커밋(Commit)__ 이라고 하며, 실제로 사용하기 전까지는 물리 메모리를 할당 받지 않는다. 위에서 설명했던 것 처럼 OS 가 가진 물리 메모리의 총량보다 프로세스가 요청하는 메모리양이 많더라도 프로그램의 실행을 허용하는데, 실제메모리 총량을 넘는 메모리를 요구를 허용하는것을 __오버커밋(Overcommit)__ 이라고 한다. Linux 의 `sar` 명령어를 통해 Commit(%) 를 확인할 수 있다.

Kubernetes 에서도 Overcommit 이라는 개념이 존재한다. Kubernetees 는 CPU, 메모리 등을 Resource 로 취급하는데 자원을 효율적으로 활용하기 위해 overcommit 을 사용한다. 특정 Pod 가 Resource 를 Upper Limit 보다 덜 사용하고 있다면, 다른 Pod 가 리소스를 더 사용할 수 있도록 해주는 것이다.

즉, __Overcommit 이란 자원을 효율적으로 사용하기 위한 기법__ 이라고 생각하면 된다.

## Process Killed by OOM Killer

만약, 프로세스가 실제 메모리 총량 보다 많이 사용을 하게 된다면 Linux Kernel OOM Killer 가 중요도(score)가 낮은 Process 를 선정하여 Kill 한다. Kubernetes 환경에서도 여러 Pod 가 사용 중일 때, Out Of Memory 를 해결하기 위해 OOM Killer 가 동작하게 된다.

__More Articles__:
- [Kernel - Out Of Memory Management](https://www.kernel.org/doc/gorman/html/understand/understand016.html)
- [Kubernetes - Node out of memory behavior](https://kubernetes.io/docs/concepts/scheduling-eviction/node-pressure-eviction/#node-out-of-memory-behavior)

## References

- [The Linux Kernel documentation](https://www.kernel.org/doc/html/latest/)
