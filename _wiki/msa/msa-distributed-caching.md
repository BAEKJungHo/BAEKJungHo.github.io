---
layout  : wiki
title   : Distributed Caching in Microservices
summary : 
date    : 2023-02-24 15:54:32 +0900
updated : 2023-02-24 20:15:24 +0900
tag     : msa caching distributed
toc     : true
comment : true
public  : true
parent  : [[/msa]]
latex   : true
---
* TOC
{:toc}

### Cache Locality

Cache locality refers to the principle that computer programs should try to maximize the use of data already present in the cache, rather than frequently accessing data from main memory. In other words, it is the concept of using memory in a way that minimizes the number of times the CPU has to wait for data to be fetched from main memory.

Cache locality is important for optimizing program performance, especially in applications that rely heavily on accessing large amounts of data. When data is accessed sequentially, or is stored in contiguous memory locations, it can be loaded into the cache more efficiently, allowing the CPU to access the data quickly and avoid having to wait for it to be fetched from main memory.

There are two types of cache locality: temporal and spatial locality. Temporal locality refers to the reuse of recently accessed data, while spatial locality refers to the use of data stored in nearby memory locations. Both types of locality are important for optimizing program performance, and programmers often use techniques such as data prefetching and loop unrolling to improve cache locality.

In summary, __Cache locality is a crucial concept in computer programming that helps to improve program performance by minimizing the number of times the CPU has to wait for data to be fetched from main memory__. By maximizing the use of data already present in the cache, programmers can make their programs more efficient and responsive.

### Cache Hit and Cache Miss 

__When a program needs to access data, the CPU first checks whether the data is present in the cache, and if it is, this is called a cache hit. If the data is not present in the cache and needs to be fetched from main memory, this is called a cache miss.__

## How to improve its performance by optimizing cache usage

캐시 적중률을 높이고 캐시 미스를 최소화 해야, 성능이 올라간다. 어떻게 캐시 적중률을 높이고 캐시 미스를 최소화 할 수 있을까?

__"공간적 지역성을 활용한다" 라고 표현하기도 하고, "데이터 지역성을 최대화 한다" 라고 표현하기도 한다.__

어쨋든 이 Locality 라는 개념을 최대화 해야 한다. 데이터 지역성을 최대화 하는 방법은 __"데이터를 블록 단위로 처리"__ 하는 것이다. __Block transfer__ or __Block prefetching__ 이라고도 한다.

즉, 개별 항목이 포함되어있는 Block 을 메인 메모리에서 캐시로 가져오는 것이다. 

하지만, 이 방식은 항상 최적의 방식은 아니다. 블록 내의 모든 데이터가 실제로 사용되지 않거나 캐시 공간이 제한된 경우 개별적으로 데이터를 가져오는게 좋다.

However, it is important to note that block transfer is not always the optimal caching strategy. In some cases, it may be more efficient to fetch individual data items into the cache, particularly if the data is not accessed together or if the cache size is limited.

Proxy 도 Data Locality 를 활용하기도 한다.

__Using a proxy to collapse requests for data that is spatially close together:__

![](/resource/wiki/msa-distributed-caching/proxy-data-locality.png)

## Caching Types

### Private Caching

![](/resource/wiki/msa-distributed-caching/private.png)

The most basic type of cache is an __in-memory store__. 단일 프로세스의 주소 공간 내에 저장됨. 애플리케이션이 여러개 띄워져 있는 경우, 각 인스턴스에서는 __서로 다른 원본 데이터의 스냅샷을 가지고 있을 수 있다.__ 따라서, 서로 다른 결과를 반환할 수 있다.

### Global Caching

__Global cache where cache is responsible for retrieval:__

![](/resource/wiki/msa-distributed-caching/global.png)

모든 인스턴스가 단일 캐시 공간을 사용함. 인메모리 방식의 캐시보다 액세스 속도가 느리다는 단점이 있으며, 별도의 캐시 서비스를 구현해야 하므로 애플리케이션 아키텍처 복잡도가 증가한다.

위 방식은 글로벌 캐시가 데이터 저장소로부터 검색을 담당하는 반면, 애플리케이션 인스턴스가 데이터 저장소로부터 검색을 담당하게 할 수 있다. 

__Global cache where request nodes are responsible for retrieval:__

1. For each request, the Instances will check the global cache fist.
2. If the data was not in the global cache then the Instances will retrieve it from the origin(Data Store)
3. When data is retrieved from the origin, it can be added to the global cache.

### Distributed Caching

분산 캐시는 각 애플리케이션 노드가 Cache 를 관리하는 모양이다. Private Cache 와 비슷하긴한데, 차이점은 분산 캐시는 각 애플리케이션 노드 내에서 관리되는 캐시에 저장된 데이터들이 서로 다르다는 것이다.

![](/resource/wiki/msa-distributed-caching/distributed-caching.png)

A disadvantage of distributed caching is remedying a missing node. Some distributed caches get around this by storing multiple copies of the data on different nodes; however, you can imagine how this logic can get complicated quickly, especially when you add or remove nodes from the request layer. Although even if a node disappears and part of the cache is lost, the requests will just pull from the origin—so it isn't necessarily catastrophic!

- [Distributed Caching with Redis](https://cloudificationzone.com/2021/11/01/distributed-caching-with-redis/)
- [쿠버네티스에 레디스 캐시 클러스터 구축기 - Kakao](https://tech.kakao.com/2022/02/09/k8s-redis/)

![](/resource/wiki/msa-distributed-caching/redis.png)

__When you configure a Redis cluster, a new cluster address is created.__ The cluster address is used by clients to access the Redis cluster, and it typically consists of a hostname or IP address and a port number.

In a Redis cluster, multiple Redis nodes are connected together to form a cluster. Each Redis node is responsible for a subset of the data that is being cached, and the nodes work together to provide a distributed cache that can store and retrieve large amounts of data quickly and efficiently.

The cluster address is used by clients to access the Redis cluster, and it typically consists of the hostname or IP address of one of the Redis nodes in the cluster, along with a port number. When a client connects to the cluster address, the Redis cluster automatically routes the request to the appropriate Redis node based on the key being accessed.

Redis 를 사용하는 경우 처리량을 높이고 싶으면, 쓰기의 경우에는 Master Node 를 확장하고 읽기 처리량을 높이고 싶은 경우에는 Replica 수를 증가시키는 것이 좋다.

## Managing concurrency in a cache

여러 인스턴스에서 캐시를 읽고, __수정__ 도 하는 경우 동시성 이슈가 발생할 수 있다. 

- __Optimistic Lock__: 데이터를 업데이트하기 직전에 애플리케이션은 캐시의 데이터가 검색된 이후 변경되었는지 여부를 확인한다. 데이터가 여전히 동일하면 변경할 수 있다.
- __Pessimistic Lock__: 데이터를 검색할 때 애플리케이션은 다른 인스턴스가 데이터를 변경하지 못하도록 캐시에 데이터를 잠근다. 수명이 짧은 작업이나 충돌 가능성이 더 높은 상황에 적합하다.

## High availability and scalability Caching Strategy

In-memory Cache 와 Global Cache 를 같이 사용할 수 있다. 이 경우 In-memory Cache 를 __Buffer__ 역할로 사용하면 된다.

__Using a local private cache with a shared cache:__

![](/resource/wiki/msa-distributed-caching/cache-both.png)

## Links

- [Scalable Web Architecture and Distributed Systems](http://www.aosabook.org/en/distsys.html)
- [Microsoft - Caching guidance](https://learn.microsoft.com/en-us/azure/architecture/best-practices/caching)
- [Microservices Distributed Caching](https://medium.com/design-microservices-architecture-with-patterns/microservices-distributed-caching-76828817e41b)
- [NGINX High-performance Caching](https://www.slideshare.net/Nginx/nginx-highperformance-caching)