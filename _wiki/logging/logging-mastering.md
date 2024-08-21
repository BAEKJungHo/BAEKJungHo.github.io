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

```
2022-12-22 01:18:07.315 DEBUG 22340 --- [connection adder] com.zaxxer.hikari.pool.HikariPool        : HikariPool-1 - Added connection conn5: url=jdbc:h2:mem:testdb user=SA
2022-12-22 01:18:08.080 DEBUG 22340 --- [connection closer] com.zaxxer.hikari.pool.PoolBase          : HikariPool-1 - Closing connection conn2: url=jdbc:h2:mem:testdb user=SA: (connection has passed maxLifetime)
2022-12-22 01:18:08.156 DEBUG 22340 --- [pool-1 housekeeper] com.zaxxer.hikari.pool.HikariPool        : HikariPool-1 - Pool stats (total=5, active=0, idle=5, waiting=0)
```

로그는 ___어떤(what)___ 이벤트가 ___언제(when)___ 발생했는지에 대한 ___시간순으로 정렬___ 된 기록이다.

## Why Important Log ?

서비스 애플리케이션을 운영하면서 ___[Logging](https://en.wikipedia.org/wiki/Logging_(computing))___ 보다 중요한게 몇개나 있을까? 아마 Logging 이 가장 중요하다고 말해도 전혀 이상하지 않다.

모든 소프트웨어는 완벽하지 않다. 아마존 부사장인 버너 보겔스(Werner Vogels)는 소프트웨어는 모두 실패한다라고 말한바 있다. 실패에 빠르게 대응할 수 있도록 설계해야 한다는 말이다. 이를 ___[Fault Tolerance](https://baekjungho.github.io/wiki/msa/msa-fault-tolerance/)___ 이라고 한다.
특히 우리 소프트웨어는 Network 를 사용하므로 네트워크 순단 상태에서의 대응도 중요하다. 관련해서 ___[Strategies for Handling Network Blips; Ensuring Resilience in Distributed Systems](https://baekjungho.github.io/wiki/network/network-blip/)___ 를 살펴보면 좋다.

내결함성(fault tolerance)를 높여도 분명 장애가 발생하는 순간이 있을 것이다. 장애가 발생했을때 <mark><em><strong>언제, 어떤 이유에 의해서 장애가 발생했는지 추적(Trace)을 해야하고, 논리적인 근거를 바탕으로 해결책을 모색</strong></em></mark> 해야하는데, 이 근거가 되는 것이 바로 ___Log___ 이다.

얼마만큼 로깅을 해야할까? 기본적으로 요청과 응답에 대해서는 무조건적으로 로깅해야 하며, @Service, @Component 등의 어노테이션을 사용한 클래스의 메서드의 요청, 응답도 로깅하는 것이 좋다.

## Distributed Systems

Distributed Systems 에서 로그를 추적하고 모니터링 하는 활동을 ___[Distributed Tracing](https://baekjungho.github.io/wiki/observability/msa-distributed-tracing/)___ 이라고 한다. 
Tracer 를 구현하기 위한 CNCF(Cloud Native Computing Foundation) 에서 구현한 비공식 표준이 ___[The OpenTracing Semantic Specification](https://github.com/opentracing/specification/blob/master/specification.md)___ 이다. 
비공식 표준 문서를 보면 꽤나 분산 환경에서의 로깅에 대해서 많이 알게될 것이다.

## Mapped Diagnostic Context

멀티 스레드 환경에서 요청을 처리하는 동안 내내 공통적으로 들고 다녀야 하는 값이 있을 수 있다. 이때 사용되는 기술이 ___[MDC(Mapped Diagnostic Context)](https://baekjungho.github.io/wiki/spring/spring-mdc/)___ 이다.

- [Mechanism of Context, Distributed Tracing with MDC](https://baekjungho.github.io/wiki/reactive/reactive-context/)
- [Logging in WebFlux with Kotlin](https://baekjungho.github.io/wiki/logging/logging-webflux-kotlin/)

## Levels

__Log Levels__:

![](/resource/wiki/logging-mastering/level.png)

debug 는 주로 디버깅하다가 상세 정보를 로깅해야할 필요가 있을때 사용한다. info 는 주요 이벤트와 같은 필수 정보 전달을 위해서 로깅한다.
warn 은 타 서버 API 와 연동시 타 서버에서 에러가 발생하여, 비지니스 로직이 실패하는 경우에 주로 사용한다. error 는 심각한 오류가 발생했을때 사용한다.
INTERNAL_SERVER_ERROR 예외가 발생하는 경우 대부분 error 로그도 같이 남기는 것이 좋다.
특히 error 로그는 ___Incidents Alert___ 을 구성할때 판단되는 필수적인 요소이기도 하다. 특히 시스템의 가용성을 파악하기 위한 핵심 지표인 ___[SLI(Service Level Indicators)](https://baekjungho.github.io/wiki/devops/devops-sre/)___ 를 설정할 때 error rate(http 요청에 대한 http status 5xx 의 비율) 와 latency 등을 기준으로 하기 때문에
심각한 에러가 아님에도 불구하고 error level 을 남발하면 무수한 Incidents Alert 을 받게될 것이다.

## Formats

__[Standard Fields](https://github.com/liangyanfeng/logstash-logback-encoder/tree/master)__:

![](/resource/wiki/logging-mastering/standard-fields.png)

___[Logback JSON Encoder](https://github.com/liangyanfeng/logstash-logback-encoder/tree/master)___ 를 사용할 때 위 필드들은 따로 명시하지 않아도 LoggingEvent 에 탐지된다.

일반적으로 아래 포맷은 Default 로 가져가는 것이 좋다. (dd 는 Datadog 을 사용하는 경우)

```kotlin
{
  "@timestamp":"2022-11-28T09:55:26.482+09:00",
  "@version": "1",
  "message": "{ JSON 형식의 메시지 }",
  "logger_name": "org.hoxy.backend.server.core.logging.CustomConsoleAppender",
  "thread_name":"Worker",
  "level":"INFO",
  "level_value":20000,
  "dd.span_id":"0",
  "dd.trace_id":"0"
}
```

Kotlin 과 LoggerFactory 를 사용하는 경우 inline 으로 간편하게 사용할 수 있다.

```kotlin
inline fun <reified T> T.logger(): Logger {
    return LoggerFactory.getLogger(T::class.java)
}

class UserService {
    private val log = logger()
    // ...
}
```

We can customize the format by using LoggingEventCompositeJsonEncoder as the encoder instead of LogstashEncoder, as they provide greater flexibility in the JSON format.
LoggingEventCompositeJsonEncoder 를 사용하면 `<providers>` 구문을 지원하는데 LogstashEncoder 보다 조금더 유연하게 customize 할 수 있다. 
요즘은 대부분 LoggingEventCompositeJsonEncoder 를 사용한다.

## Database Logging

- [Hibernate 를 사용하는 경우 Log 남기기](https://kwonnam.pe.kr/wiki/java/hibernate/log#log4j)

## Mask Sensitive Data

- [Microservices Consistent Logging in Kubernetes Cluster with Logstash](https://www.linkedin.com/pulse/microservices-consistent-logging-kubernetes-cluster-logstash-jain/)
- [Mask json values using logback - stackoverflow](https://stackoverflow.com/questions/69623161/mask-json-values-using-logback)
- [Mask Sensitive Data in Logs With Logback - Baeldung](https://www.baeldung.com/logback-mask-sensitive-data)

## References

- [The Log: What every software engineer should know about real-time data's unifying abstraction - Jay Kreps](https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying)
- [Designing Data-Intensive Applications. The Big Ideas Behind Reliable, Scalable and Maintainable Systems](https://ebrary.net/64591/computer_science/designing_data-intensive_applications_the_big_ideas_behind_reliable_scalable_and_maintainable_syst)
- [Logback Architecture](https://logback.qos.ch/manual/architecture.html)