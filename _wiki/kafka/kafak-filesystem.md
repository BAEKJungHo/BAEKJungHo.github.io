---
layout  : wiki
title   : PageCache Centric Designs
summary : Don't fear the Filesystem!
date    : 2024-09-12 20:54:32 +0900
updated : 2024-09-12 21:15:24 +0900
tag     : kafka linux
toc     : true
comment : true
public  : true
parent  : [[/kafka]]
latex   : true
---
* TOC
{:toc}

## PageCache Centric Designs

___[Don't fear the Filesystem!](https://kafka.apache.org/33/documentation.html#design_filesystem)___

Kafka 는 메시지를 저장하고 캐싱하기 위해서 ___FileSystem___ 을 사용한다. "disks are slow" 라는 인식이 있지만 적절하게 설계된 디스크 구조는 종종 네트워크만큼 빠를 수 있다.

___[The Pathologies of Big Data](https://queue.acm.org/detail.cfm?id=1563874)___ 글을 통해, 실제로 순차적 디스크 액세스가 경우에 따라 랜덤 메모리 액세스보다 빠를 수 있다는 것을 알 수 있다.

JVM 을 사용하는 경우, 메모리 관련한 2가지 사실을 알 수 있다.

1. The memory overhead of objects is very high, often doubling the size of the data stored (or worse).
2. Java garbage collection becomes increasingly fiddly and slow as the in-heap data increases.

이러한 이유로 인해 파일 시스템을 사용하고 페이지 캐시에 의존하는 것이 메모리 내 캐시나 다른 구조를 유지하는 것보다 우수하다. 또한 캐시와 파일 시스템 간의 일관성을 유지하기 위한 모든 로직이 이제 OS에 있으므로 코드가 크게 단순화 된다.

All data is immediately written to a persistent log on the filesystem without necessarily flushing to disk. In effect this just means that it is transferred into the kernel's pagecache.

## Links

- [The Pathologies of Big Data - Scale up your datasets enough and all your apps will come undone. What are the typical problems and where do the bottlenecks generally surface?](https://dl.acm.org/doi/pdf/10.1145/1563821.1563874)