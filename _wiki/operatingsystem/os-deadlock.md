---
layout  : wiki
title   : Deadlock
summary : 
date    : 2024-04-05 15:02:32 +0900
updated : 2024-04-05 15:12:24 +0900
tag     : operatingsystem
toc     : true
comment : true
public  : true
parent  : [[/operatingsystem]]
latex   : true
---
* TOC
{:toc}

## Deadlock

__[교착상태(膠着狀態, deadlock)](https://en.wikipedia.org/wiki/Deadlock)__ 은 두 개 이상의 작업이 서로 상대방의 작업이 끝나기 만을 기다리고 있기 때문에 결과적으로 아무것도 완료되지 못하는 상태를 의미한다.

![](/resource/wiki/os-deadlock/deadlock.png)

### Individually necessary and jointly sufficient conditions for deadlock

[Deadlock](https://wiki.c2.com/?DeadLock) 이 발생하기 위해서는 아래 4가지 조건을 모두 만족해야 한다.

- 상호배제(Mutual exclusion): 최소한 하나의 리소스가 공유 불가능 모드로 유지되어야 한다. 즉, 즉, 한 번에 하나의 프로세스만 리소스를 사용할 수 있다.
- 점유대기(Hold and wait): 프로세스가 할당된 자원을 가진 상태에서 다른 자원을 기다린다. 프로세스가 현재 하나 이상의 리소스를 보유하고 있으며 다른 프로세스가 보유하고 있는 추가 리소스를 요청한다.
- 비선점(No preemption): 자원을 보유하고 있는 프로세스에 의해서만 자원이 자발적으로 해제될 수 있다. 즉, 프로세스가 자원의 사용을 끝낼 때까지 다른 프로세스가 그 자원을 뺏을 수 없다.
- 순환대기(Circular wait): 각 프로세스는 다른 프로세스가 보유하고 있는 자원을 기다려야 하며, 그 자원은 첫 번째 프로세스가 자원을 해제할 때까지 기다려야 한다.

### Three commonly used strategies to handle deadlocks are as follows

The best defense against [deadlocks](https://www.postgresql.org/docs/current/explicit-locking.html#LOCKING-DEADLOCKS) is generally to avoid them by being certain that all applications using a database acquire locks on multiple objects in a consistent order.

- Avoidance: Resources are carefully allocated to avoid deadlocks.
- Prevention: 4가지 조건 중 하나를 회피함으로써 교착상태가 발생하는 것을 방지한다.
- Detection and recovery: Deadlocks are allowed to occur and a detection algorithm is used to detect them. After a deadlock is detected, it is resolved by certain means.


### Distributed Deadlock

[Distributed System – Types of Distributed Deadlock](https://www.geeksforgeeks.org/distributed-system-types-of-distributed-deadlock/)

분산 교착 상태에는 크게 2가지 유형이 있다. Resource Deadlock 과 Communication Deadlock 이다.

__Resource Deadlock__:

![](/resource/wiki/os-deadlock/resource-deadlock.png)

실행을 위해 필요한 리소스를 모두 획득하기 전까지는 진행이 불가능하다. 프로세스 1에는 R1, R2가 있고 리소스 R3을 요청한다. 그 중 하나라도 누락되면 실행되지 않습니다. 요청된 모든 리소스(R1, R2, R3)를 획득한 경우에만 진행된다.

__Communication Deadlock__:

![](/resource/wiki/os-deadlock/communication-deadlock.png)

프로세스 1은 프로세스 2와 통신을 시도하고, 프로세스 2는 프로세스 3과 통신을 시도하고, 프로세스 3은 프로세스 1과 통신을 시도한다. 이 상황에서는 어떤 프로세스도 차단 해제되지 않고 통신 교착 상태가 발생한다.

## Links

- [Deadlock: What It Is, How to Detect, Handle and Prevent?](https://www.baeldung.com/cs/os-deadlock)
- [PostgreSQL - Explicit Locking](https://www.postgresql.org/docs/current/explicit-locking.html#EXPLICIT-LOCKING)