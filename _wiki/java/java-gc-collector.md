---
layout  : wiki
title   : Garbage Collector Algorithms
summary : Serial, Throughput, CMS, G1GC, ZGC
date    : 2023-11-23 11:28:32 +0900
updated : 2023-11-23 12:15:24 +0900
tag     : gc java kotlin
toc     : true
comment : true
public  : true
parent  : [[/java]]
latex   : true
---
* TOC
{:toc}

## Garbage Collector Algorithms

__[“compacting the heap”](https://dinfuehr.github.io/blog/a-first-look-into-zgc/)__ just means moving the still-alive objects to the start (or some other region) of the heap.

### Serial Garbage Collector

시리얼 가비지 컬렉터는 네 개 중에서 가장 단순하다. 

Old 영역의 GC는 [mark-sweep-compact](https://baekjungho.github.io/wiki/java/java-garbage-collection/#mark-and-compact) 라는 알고리즘을 사용한다.

- Mark - Old 영역에 살아있는 객체를 식별한다.
- Sweep - 힙(heap)의 앞 부분부터 확인하여 살아 있는것만 남긴다.
- Compaction - 각 객체들이 연속되게 쌓이도록 힙의 가장 앞 부분부터 채워서 객체가 존재하는 부분과 없는 부분으로 나눈다.

시리얼 컬렉터는 힙을 처리하기 위해 단일 스레드를 사용한다. Minor GC 또는 Full GC 가 발생하면 힙이 처리되면서 모든 애플리케이션 스레드가 멈출 것이다.

### Throughput Collector

처리율 컬렉터는 영 제너레이션을 수집할 때 스레드를 여러 개 사용하는데, 이로 인해 시리얼 컬렉터를 사용할 때보다 마이너 GC 가 더 빨라진다. 처리율 컬렉터는 올드 제너레이션을 처리할 때도 여러 개의 스레드를 이용할 수 있다.
이건 JDK 7u4 와 이후 릴리즈 버전에서 디폴트이다.

처리율 컬렉터는 여러개의 스레드를 사용하기 때문에 __병렬 컬렉터(parallel collector)__ 라고 부른다. 처리율 컬렉터는 Minor GC 또는 Full GC 가 발생할 때 모든 애플리케이션 스레드를 멈춘다.

### CMS Collector

CMS 컬렉터는 처리율과 시리얼 컬렉터에서 Full GC 주기와 관련해서 생기는 __긴 중지(high pause)__ 현상을 없애도록 설계됐다. CMS 는 Minor GC 동안 모든 애플리케이션 스레드를 중지 시키며, 여러개의 스레드로 수행한다.

하지만 CMS 컬렉터는 영 제너레이션을 수집하는데 처리율 컬렉터(`-XX:+UseParallelGC`)와는 달리 다른 알고리즘(`-XX:+UseParNewGC`)을 사용한다.

CMS 는 Full GC 동안 애플리케이션 스레드를 멈추지 않고 주기적으로 올드 제너레이션을 살피고, 미사용 객체를 폐기하는 데 하나 이상의 백그라운드 스레드를 사용한다. 이로 인해 CMS 는 __저중단(low pause)__ 컬렉터가 된다.

애플리케이션 스레드는 Minor GC 가 일어나는 동안에만 중지되고, 특정 시점에 아주 잠시 동안 백그라운드 스레드가 올드 제너레이션을 살핀다.

따라서, Stop The World 시간의 총합은 처리율 컬렉터를 썼을 때보다 적다.

여기서 트레이드 오프는 __CPU 사용량이 증가__ 한다는 점이다.

CMS 는 `-XX:+UseConcMarkSweepGC` 또는 `-XX:+UseParallelGC` 플래그를 명시하면 사용할 수 있다.

### G1GC

__[Garbage First Garbage Collector(G1GC)](https://www.oracle.com/java/technologies/javase/hotspot-garbage-collection.html)__ 는 최소한으로 중지시키며, 약 4GB 이상의 큰 힙을 처리하도록 설계됐다. __힙을 여러 개의 영역(region)으로 나누지만__ 여전히 제너레이션 기반의 컬렉터다. 이 역시 여러개의 스레드를 사용한다. JDK9 부터는 기본으로 채택되었다.

__G1 Heap Allocation__:

![](/resource/wiki/java-garbage-collection/g1-heap-allocation.png)

G1 은 __동시 병렬 컬렉터__ 이다. 대부분의 작업을 수행하는 데 애플리케이션 스레드를 중단시킬 필요가 없는 __백그라운드 스레드__ 로 올드 제너레이션을 처리한다.

올드 제너레이션은 여러 영역으로 나뉘기 때문에 G1 은 한 영역에서 다른 데로 복사해서 올드 제너레이션에서 객체를 치울 수 있으며, 일반적인 처리를 하는 동안 힙을 압축할 수 있다.

G1 은 `-XX:+UseG1GC` 플래그를 명시하면 사용할 수 있다.

### ZGC

The Z Garbage Collector, also known as ZGC, is a scalable low-latency garbage collector

- [ZGC Wiki - OpenJDK](https://wiki.openjdk.org/display/zgc/Main)
- [Deep Dive into ZGC: A Modern Garbage Collector in OpenJDK](https://dl.acm.org/doi/10.1145/3538532#d1e1202)
- [JEP 376: ZGC: Concurrent Thread-Stack Processing](https://openjdk.org/jeps/376)
- [A FIRST LOOK INTO ZGC](https://dinfuehr.github.io/blog/a-first-look-into-zgc/)
- [Java's new Z Garbage Collector (ZGC) is very exciting](https://www.opsian.com/blog/javas-new-zgc-is-very-exciting)
- [ZGC: A Scalable Low-Latency Garbage Collector](https://www.youtube.com/watch?v=kF_r3GE3zOo)
- [OpenJDK16 ZGC source code analysis Load Barrier](https://www.fatalerrors.org/a/openjdk16-zgc-source-code-analysis-load-barrier.html)
- [Simone Bordet — Concurrent Garbage collectors: ZGC & Shenandoah](https://www.youtube.com/watch?v=e2lXj_t7ZBc)
- [ZGC - perliden](https://malloc.se/)
- [ZGC 에 대하여 - Dreamus](https://www.blog-dreamus.com/post/zgc%EC%97%90-%EB%8C%80%ED%95%B4%EC%84%9C)
- [ZGC 기본 개념 이해하기 - Naver D2](https://d2.naver.com/helloworld/0128759)
- [ZGC (The Z Garbage Collector) - Catsbi's DLog](https://catsbi.oopy.io/56acd9f4-4331-4887-8bc3-e3e50b2f3ea5)
- [ZGC, The Z Garbage Collector - Johngrib](https://johngrib.github.io/wiki/java/gc/zgc/)

## References

- Optimizing Java / Benjamin Evans, James Gough, Chris Newland / O'REILLY
- Java Performance: The Definitive Guide / Scott Oaks / O'REILLY
- The Garbage Collection Handbook / Richard Jones, Antony Hosking, Eliot Moss / Chapman and Hall/CRC