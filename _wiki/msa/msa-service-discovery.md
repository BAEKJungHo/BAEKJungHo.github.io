---
layout  : wiki
title   : Service Discovery
summary : 
date    : 2023-02-03 15:54:32 +0900
updated : 2023-02-03 20:15:24 +0900
tag     : msa
toc     : true
comment : true
public  : true
parent  : [[/msa]]
latex   : true
---
* TOC
{:toc}

## Service Discovery

[Service discovery](https://microservices.io/tags/service%20discovery) is a technique for identifying and locating services in a distributed system environment. It enables services to be automatically located, registered and connected to one another, without requiring human intervention or manual configuration.

Benefits of service discovery include:

- __Scalability__: Service discovery makes it easier to scale systems by allowing services to dynamically discover each other as new instances are added or removed.
- __Resilience__: Service discovery can help ensure that services continue to function even if individual components fail, by automatically detecting and routing around failures

[Netflix Eureka](https://github.com/Netflix/eureka) + Spring Cloud Gateway 조합이 좋음. 서비스 디스커버리는 꼭 필요한 경우에 사용. Microservice 수가 적다면 굳이 사용하지 않아도 됨. 운영/유지 비용도 고려해야 함.

## Links

- [DZone Service Discovery in a Microservices Architecture](https://dzone.com/articles/service-discovery-in-a-microservices-architecture)
- [Service Discovery - NGINX](https://www.nginx.com/blog/service-discovery-in-a-microservices-architecture/)
- [Service Discovery in Microservices - Baeldung](https://www.baeldung.com/cs/service-discovery-microservices)
- [Service Discovery DR 구성 1부 - Eureka 서버를 지역 분산시켜 안정성을 높이자](https://11st-tech.github.io/2022/12/30/eureka-disaster-recovery-1/)
- [Service Discovery DR 구성 2부 - Chaos Test 로 찾은 예기치 못했던 문제를 고쳐라!](https://11st-tech.github.io/2022/12/30/eureka-disaster-recovery-2/)