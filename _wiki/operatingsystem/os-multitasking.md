---
layout  : wiki
title   : Designing Context Structures for Suspend/Resume in Multitasking
summary : Concurrency in Modern Programming - From Processes to Coroutines
date    : 2024-11-01 15:02:32 +0900
updated : 2024-11-01 18:12:24 +0900
tag     : operatingsystem cpu coroutine virtualthread
toc     : true
comment : true
public  : true
parent  : [[/operatingsystem]]
latex   : true
---
* TOC
{:toc}

## Designing Context Structures for Suspend/Resume in Multitasking

___[CPU](https://klarciel.net/wiki/operatingsystem/os-fetch-execute-cycle/)___ 는 한 번에 한 가지 일만 할 수 있다. 여러 프로그램이 존재하는 경우 동시에 실행되는 것처럼 보이게 하기 위해서는 CPU 의 ___전환 빈도(conversion frequency)___ 가 빨라야 한다.
ProgramA 에서 ProgramB 로 전환이 일어날 때 ProgramA 는 ___일시 중단(suspend)___ 되어야 한다. 일시 중단된 이후 다시 ___재개(resume)___ 될 때, 이전에 유지했던 ___상태(context)___ 를 이용해야 한다.
즉, 일시 중단되었을때의 ___상태(context)___ 를 저장할 ___구조(structure)___ 가 필요하다. 

CPU 가 어떤 기계 명령어를 실행했는지와 CPU 내부의 기타 레지스터 값 등 상태 값을 저장할 수 있다면 프로그램을 일시 중단 했다가도 저장된 ___context___ 를 이용하여 프로그램 실행을 ___resume___ 할 수 있다.

```
struct *** {
  context ctx; // CPU 의 context 를 저장
  ...
}
```

이것이 ___[Process](https://klarciel.net/wiki/spring/spring-concurrency/)___ 의 탄생이다. 모든 프로그램은 실행된 후 프로세스 형태로 관리된다. 따라서 실행하기 전을 프로그램(program), 실행된 이후를 프로세스(process) 라고 부르기도 한다.
CPU 가 하나 뿐인 시스템에서도 여러 프로세스를 동시에 실행하거나, 동시에 실행되는 것처럼 보이게 할 수 있다. 멀티태스팅(multitasking)을 실현해주는 프로세스 관리 도구등 여러가지 기반 기능의 프로그램을 모아둔 도구 이름을 ___Operation System___ 이라고 한다.

### Multi Processing

Multi-Processing Programming 의 경우에 두 함수가 동기적으로 실행된다고 가정하자. funcA 와 funcB 가 존재하고 funcB 의 결과를 funcA 로 전달하기 위해서는 ___inter-process communication___ 이 필요하다.
이러한 방식의 단점은 프로세스끼리의 전환이 일어날때 ___context switching___ 이 일어난다는 것이다. 프로세스는 Heap, Stack 등 프로세스가 관리하는 메모리 영역을 PCB 에 이전 정보를 저장해 두고, 새로운 프로세스의 메모리 영역을 사용한다.
Process 간 context switching 비용은 크다. ___high throughput___ 을 달성하기 위해서는 context switching 비용을 줄여야할 것이다.

> 프로세스를 생성할 때는 메모리에서 실행 파일을 적재할 적절한 영역을 찾은 후 CPU 의 PC 레지스터를 main 함수의 주소로 지정해야한다. 즉, 프로세는 entry function 이 main 한 개 뿐이다.

### Multi Threading

high throughput 을 위해서는 동일 프로세스 주소 공간을 공유하기 위한 모델을 ___[Thread](https://en.wikipedia.org/wiki/Thread_(computing))___ 라고 한다.

![](/resource/wiki/os-multitasking/ctx-swithcing.png)

프로세스의 stack 영역을 제외한 나머지 주소 공간을 공유하기 때문에 ___context switching___ 이 프로세스에 비해 상대적으로 저렴하다.

하지만, 대용량 처리량을 필요로하는 서비스의 경우 Thread-Per Request 방식으로 충분할까 ? 

이와 같은 문제를 해결하고자 등장한 것이 비동기 프로그래밍 스타일이다. 

### Coroutines

___[Coroutines](https://klarciel.net/wiki/kotlin/kotlin-suspend/)___ 는 가볍고 효율적인 비동기 작업, 협력적 멀티태스킹으로 자원 절약을 위한 매커니즘이다.
높은 성능과 동시성 향상을 위한 매커니즘 중 하나이다.

Coroutines 도 Thread 내에서 suspend/resume 되면서 동작하기 때문에, 실제 Function 에서 Thread Stack 영역에 물고 있어야 하는 정보(___context___)를 저장하는 역할이 필요한데
이를 ___[Continuation](https://klarciel.net/wiki/kotlin/kotlin-continuation/)___ 이라고한다.

> Process 의 탄생 과정을 살펴보면 Continuation 을 이해하기 수월하다. OS 가 스레드를 스케줄링 하는 것과 똑같다. 스레드도 일시 중지될 수 있으며, OS 가 먼저 스레드의 실행 상태를 저장했다가 다른 스레드의 스케줄링을 진행하고, 일시 중지된 스레드가 다시 CPU 의 리소스를 할당 받으면 스레드는 마치 일시 중지된 적 없는 것처럼 이어서 실행한다.
> 프로그래머는 Coroutine Scheduling 제어권을 갖는다.

Coroutine 의 Stack 영역은 모두 힙 영역에 배치된다. 그렇기 때문에 수시로 Coroutine 을 일시 중단하고 재개할 수 있는 것이다.

### VirtualThread

- [VirtualThread; Provide High-throughput not Low-Latency](https://klarciel.net/wiki/java/java-virtual-thread/)

## References

- The secret of the underlying computer / lu xiaofeng