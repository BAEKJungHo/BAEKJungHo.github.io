---
layout  : wiki
title   : Cache Consistency 
summary : 
date    : 2023-07-04 15:54:32 +0900
updated : 2023-07-04 20:15:24 +0900
tag     : msa caching lock distributed
toc     : true
comment : true
public  : true
parent  : [[/msa]]
latex   : true
---
* TOC
{:toc}

## Cache Consistency

- [Martin Kleppmann - How to do distributed locking](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)
- [DTM - Cache Consistency](https://en.dtm.pub/app/cache.html)
- [Consistency between Redis Cache and SQL Database](https://yunpengn.github.io/blog/2019/05/04/consistent-redis-sql/)
- [The Seven Most Classic Patterns for Distributed Transactions](https://medium.com/@dongfuye/the-seven-most-classic-solutions-for-distributed-transaction-management-3f915f331e15)

## What are you using that lock for?

__The purpose of a lock is__:

- __Efficiency__: Taking a lock saves you from unnecessarily doing the same work twice (e.g. some expensive computation)
- __Correctness__: Taking a lock prevents concurrent processes from stepping on each others’ toes and messing up the state of your system

## How to occur Lost Updates ?

캐시를 사용할 때 주의사항은 __Lost Updates__ 를 방지해야한다.

근데 이, 갱신 손실(Lost Updates)은 __PAUSE__ 에 취약(vulnerable)하다. PAUSE 의 유형에 대해서 알아두면 갱신 손실을 방지하는데 도움이 된다.

### Process PAUSE by Network Delay

첫 번째는 Network Delay 에 의한 프로세스 멈춤이다.

![](/resource/wiki/msa-cache-consistency/network-delay.png)

위 흐름에서, Cache Storage 에 저장된 최종 Value 는 v1 이다. 이러한 현상을 갱신 손실(Lost Updates)라 한다.

### Lock is Perfect Solution to prevent Lost Updates ?

Lost Updates 를 방지(prevent) 하기 위해 Lock 개념을 도입해보자.

Service1 이 __공유 자원(shared resources)__ 을 먼저 선점하는 경우 Lock 을 걸어버리고 모든 트랜잭션이 완벽하게 종료되는 시점에 Lock 을 해제하도록 하면 된다.

> Shared Resources Concept 에 대한 지식이 부족하면 아래 Articles 를 참고하면 도움이 된다.
> 
> [Concurrency](https://baekjungho.github.io/wiki/spring/spring-concurrency/) & [Concurrency Resolution](https://baekjungho.github.io/wiki/spring/spring-concurrency-resolve/)

Lock 이 Lost Updates 를 방지하기 위한 완벽한 솔루션 처럼 보이지만 그렇지 않다.

![](/resource/wiki/msa-cache-consistency/stw-lock.png)

Client1 이 잠금을 획득했지만 GC 의 StopTheWorld 시간이 Lock 의 LeaseTime 보다 긴 경우, 그림과 같이 Lost Updates 가 발생할 수 있다.

## Making the lock safe with Fencing

위 문제에 대한 해결책은 __Fencing Token__ 을 사용하는 것이다.

![](/resource/wiki/msa-cache-consistency/fencing.png)

In this context, a fencing token is simply a number that increases (e.g. incremented by the lock service) every time a client acquires the lock.

For example, if you are using ZooKeeper as lock service, you can use the zxid or the znode version number as fencing token, and you’re in good shape

## DTM - TagAsDeleted

Cache 를 사용하는 경우 Database 와의 일관성을 지키는 일은 노력이 필요하다는 것을 느꼈을 것이다.

찾아보니, 이러한 문제를 해결해주는 Solution 도 있다.

- [DTM - rockscache](https://github.com/dtm-labs/rockscache)

DTM 에서는 __TagAsDeleted__ 개념을 도입해서 STW 시 발생할 수 있는 Lost Updates 문제를 해결했다고 하는데, 그래프가 없어서.. [Problem & Solution](https://en.dtm.pub/app/cache.html#problem-and-solution) 부분을 완벽하게 이해하지 못했다.

## MySQL binlog Replication

[Large Scale Distributed Systems - Improving cache consistency](http://simongui.github.io/2016/12/02/improving-cache-consistency.html) 여기서 캐시 일관성을 맞추기 위한 
몇가지 방법들을 소개하는데 마지막에 보면 MySQL binlog Replication 을 통해서 캐시와 DB 일관성을 맞출 수 있다고 한다.

MySql binLog 는 모든 트랜잭션이 순서대로 기록되어 있다. 그리고 2가지 옵션이 필요하다고 말한다.

- Interpret the raw SQL syntax and issue SET operations.
- The web application embeds cache keys as a comment in the SQL.

```
         +------------+ +------------+ +------------+ +------------+ +------------+
         | web server | | web server | | web server | | web server | | web server |
         +------------+ +------------+ +------------+ +------------+ +------------+
              |  |           |  |           |  |           |  |           |  |
N connections |  |           |  |           |  |           |  |           |  |
              |  |           |  |           |  |           |  |           |  |
         +----v--v-----------v--v-----------v--v-----------v--v-----------v--v----+
         |                 database (mssql, mysql,,oracle, postgres)              |
         +------------------------------------^-----------------------------------+
                                              |
                                 1 connection |
                                              |
                               +---------------------------+
                               | binlog replication client |
                               +---------------------------+
                                            |  |
                              N connections |  |
                                            |  |
         +----------------------------------v--v----------------------------------+
         |                         cache (memcache, redis)                        |
         +------------------------------------------------------------------------+
```

__Benefits__:
- Drastically reduces connection load on the cache service(s). Web servers only connect to the database.
- Sequential consistency because we are reading the databases commit log into the cache service(s).
- Possible to connect to any MySQL replica in the replication chain since they are all sequentially consistent.

## Links

- [Caching Strategy and Eviction Policies](https://baekjungho.github.io/wiki/architecture/architecture-cache-strategy/)
- [Distributed Lock with Redis](https://baekjungho.github.io/wiki/redis/redis-lock/)
- [Improve statement caching efficiency with Hiberneate](https://baekjungho.github.io/wiki/spring/spring-query-cache-plan/)
- [Distributed Caching in Microservices](https://baekjungho.github.io/wiki/msa/msa-distributed-caching/)
- [캐시 문제 해결 가이드 - DB 과부하 방지 실전 팁 - TossTech](https://toss.tech/article/cache-traffic-tip)