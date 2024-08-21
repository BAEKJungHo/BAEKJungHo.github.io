---
layout  : wiki
title   : LOG MASTERING
summary : 
date    : 2024-08-21 19:54:32 +0900
updated : 2024-08-21 20:15:24 +0900
tag     : logging msa distributed
toc     : true
comment : true
public  : true
parent  : [[/logging]]
latex   : true
---
* TOC
{:toc}

# LOG MASTERING

## What is Log ?

로그는 가장 단순하게 추상화된 저장소이며, ___Append-only___ 만 가능하고, 전체 이벤트가 <mark><em><strong>시간 순서대로 정렬된</strong></em></mark> 자료구조를 의미한다.

![](/resource/wiki/logging-mastering/log.png)

로그는 ___어떤(what)___ 이벤트가 ___언제(when)___ 발생했는지에 대한 ___시간순으로 정렬___ 된 기록이다.

## Why Important Log ?

서비스 애플리케이션을 운영하면서 ___[Logging](https://en.wikipedia.org/wiki/Logging_(computing))___ 보다 중요한게 몇개나 있을까? 아마 Logging 이 가장 중요하다고 말해도 전혀 이상하지 않다.

모든 소프트웨어는 완벽하지 않다. 아마존 부사장인 버너 보겔스(Werner Vogels)는 소프트웨어는 모두 실패한다라고 말한바 있다. 실패에 빠르게 대응할 수 있도록 설계해야 한다는 말이다. 이를 ___[Fault Tolerance](https://baekjungho.github.io/wiki/msa/msa-fault-tolerance/)___ 이라고 한다.
특히 우리 소프트웨어는 Network 를 사용하므로 네트워크 순단 상태에서의 대응도 중요하다. 관련해서 ___[Strategies for Handling Network Blips; Ensuring Resilience in Distributed Systems](https://baekjungho.github.io/wiki/network/network-blip/)___ 를 살펴보면 좋다.

내결함성(fault tolerance)를 높여도 분명 장애가 발생하는 순간이 있을 것이다. 장애가 발생했을때 <mark><em><strong>언제, 어떤 이유에 의해서 장애가 발생했는지 추적(Trace)을 해야하고, 논리적인 근거를 바탕으로 해결책을 모색</strong></em></mark> 해야하는데, 이 근거가 되는 것이 바로 ___Log___ 이다.

## Distributed Systems

Distributed Systems 에서 로그를 추적하고 모니터링 하는 활동을 ___[Distributed Tracing](https://baekjungho.github.io/wiki/observability/msa-distributed-tracing/)___ 이라고 한다. 
Tracer 를 구현하기 위한 CNCF(Cloud Native Computing Foundation) 에서 구현한 비공식 표준이 ___[The OpenTracing Semantic Specification](https://github.com/opentracing/specification/blob/master/specification.md)___ 이다. 
비공식 표준 문서를 보면 꽤나 분산 환경에서의 로깅에 대해서 많이 알게될 것이다.

## Mapped Diagnostic Context

멀티 스레드 환경에서 요청을 처리하는 동안 내내 공통적으로 들고 다녀야 하는 값이 있을 수 있다. 이때 사용되는 기술이 ___[MDC(Mapped Diagnostic Context)](https://baekjungho.github.io/wiki/spring/spring-mdc/)___ 이다.

- [Mechanism of Context, Distributed Tracing with MDC](https://baekjungho.github.io/wiki/reactive/reactive-context/)
- [Logging in WebFlux with Kotlin](https://baekjungho.github.io/wiki/logging/logging-webflux-kotlin/)

## References

- [The Log: What every software engineer should know about real-time data's unifying abstraction - Jay Kreps](https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying)
- [Designing Data-Intensive Applications. The Big Ideas Behind Reliable, Scalable and Maintainable Systems](https://ebrary.net/64591/computer_science/designing_data-intensive_applications_the_big_ideas_behind_reliable_scalable_and_maintainable_syst)