---
layout  : wiki
title   : Reason of kernel memory increasing
summary : 
date    : 2023-06-23 11:28:32 +0900
updated : 2023-06-23 12:15:24 +0900
tag     : linux java
toc     : true
comment : true
public  : true
parent  : [[/linux]]
latex   : true
---
* TOC
{:toc}

## Reason of kernel memory increasing

[Docker, Kubernetes with Linux Kernel OOM Killer](https://baekjungho.github.io/wiki/linux/linux-oom-killer/) 글의 Debugging 파트에서, 수정된 소스로 배포 후 Datadog Monitoring 을 통해
container.memory.kernel 값이 급격하게 증가하지 않게 된 것을 확인하였다. 즉, Pod Restart/Killed 가 일어나지 않았다.

그러면 container.memory.kernel 는 컨테이너는 가상 메모리를 사용하고, 커널 메모리는 가상 메모리의 일부이다. 이 값이 어떤 경우에 증가하는 지를 알아야 한다. 

__Virtual Memory Address__:

![](/resource/wiki/linux-increase-kernel-memory/memory.png)

- 코드(Code): 커널의 핵심 기능을 구현하는 코드로, 시스템 호출 처리, 스케줄링, 인터럽트 처리 등이 포함됩니다.
- 데이터(Data): 커널 내부에서 사용되는 데이터 구조들이 저장되는 영역입니다. 예를 들면 프로세스 제어 블록(Process Control Block, PCB), 파일 시스템 캐시, 네트워크 연결 관리 정보, 디바이스 드라이버 구조체 등이 여기에 포함됩니다.
- 스택(Stack): 커널 모드에서 실행되는 코드의 호출과 반환을 관리하는 스택입니다. 커널 내부에서 인터럽트나 예외 처리, 프로세스 컨텍스트 전환 등이 발생할 때 사용됩니다.
- 모듈(Module): 커널에 동적으로 로드되는 확장 모듈들이 메모리에 적재되는 영역입니다. 이 모듈들은 커널의 기능을 확장하거나 새로운 드라이버를 추가하는 데 사용됩니다.
- 하드웨어 및 드라이버 영역: 커널은 하드웨어를 제어하기 위한 드라이버를 포함하며, 이러한 드라이버들이 메모리에 할당되어 동작합니다. 예를 들면 그래픽 드라이버, 네트워크 드라이버, 디스크 드라이버 등이 여기에 속합니다.
- 힙(Heap): 동적으로 할당되는 커널 메모리 영역으로, 커널 내에서 동적 메모리 할당이 필요한 경우 사용됩니다. 일반적으로 커널의 힙은 사용되지 않는 시간에는 비워져 있을 수 있습니다.

__Kernel memory is increasing in Java applications__:

- 네이티브 메소드 호출: 자바 애플리케이션은 JNI(Java Native Interface)를 통해 네이티브 코드를 호출할 수 있습니다. 이 경우 네이티브 코드에서 커널 메모리를 직접 사용하는 경우가 있을 수 있습니다. 네이티브 코드가 시스템 호출, 메모리 매핑 등과 같은 저수준의 작업을 수행할 때 커널 메모리 사용량이 증가할 수 있습니다.
- 스레드 및 프로세스 생성: 자바 애플리케이션은 스레드 및 프로세스를 동적으로 생성할 수 있습니다. 새로운 스레드 또는 프로세스가 생성될 때, 커널은 해당 스레드 또는 프로세스에 필요한 자원과 메모리를 할당합니다. 따라서 스레드 또는 프로세스의 생성이 많이 발생하면 커널 메모리 사용량이 급격하게 증가할 수 있습니다.
- 메모리 누수(Memory Leak): 자바 애플리케이션에서 메모리 누수가 발생할 경우, 가비지 컬렉션(Garbage Collection)이 제대로 이루어지지 않아 메모리가 해제되지 않을 수 있습니다. 이로 인해 자바 힙 메모리가 차고 나서 시스템은 추가적인 메모리를 할당하기 위해 커널 메모리를 사용하게 됩니다.
- 네트워크 및 I/O 작업: 자바 애플리케이션은 네트워크 통신이나 파일 I/O 작업을 수행할 수 있습니다. 이러한 작업은 커널 메모리를 사용하여 네트워크 버퍼링이나 파일 시스템 캐시 등을 처리합니다. 따라서 많은 양의 네트워크 트래픽이나 I/O 작업이 발생하면 커널 메모리 사용량이 증가할 수 있습니다.