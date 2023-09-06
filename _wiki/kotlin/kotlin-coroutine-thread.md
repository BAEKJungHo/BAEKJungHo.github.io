---
layout  : wiki
title   : Process, Thread, Coroutine
summary : 
date    : 2023-09-04 20:54:32 +0900
updated : 2023-09-04 21:15:24 +0900
tag     : kotlin coroutine
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Coroutine and Thread

- Coroutine 은 suspend 되었다가 resume 될때 다른 Thread 에 배정될 수 있다.
- Coroutine 은 yield 를 통해서 다른 Coroutine 에게 실행을 양보할 수 있다. (Thread 의 경우에는 OS 가 스레드를 멈추고 다른 스레드를 실행한다.) 이렇게 스스로 자리를 넘어주는 것을 __비선점형__ 이라고 한다.

## Context Switching

Process 는 Heap, Stack 등 프로세스가 관리하는 메모리 영역을 PCB 에 이전 정보를 저장해 두고, 새로운 프로세스의 메모리 영역을 사용한다.
이렇게 프로세스 끼리 메모리 영역을 교체하는 것을 Context Switching 이라고 한다.

Thread 는 Stack 영역만 교체한다. 따라서 Context Switching 비용이 Process 보다 적다.

동일 스레드 내에서 여러 Coroutine 이 실행되는 경우에는 메모리 전체를 공유하므로 Context Switching 비용이 Thread 보다 적다.