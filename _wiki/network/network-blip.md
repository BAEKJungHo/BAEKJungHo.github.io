---
layout  : wiki
title   : Strategies for Handling Network Blips; Ensuring Resilience in Distributed Systems
summary : Retry Mechanism, Circuit Breaker, Timeout, Fallback, Graceful Degradation
date    : 2024-08-17 11:54:32 +0900
updated : 2024-08-17 12:15:24 +0900
tag     : network distributed
toc     : true
comment : true
public  : true
parent  : [[/network]]
latex   : true
---
* TOC
{:toc}

## Network Blip

네트워크 연결이 매우 짧은 시간 동안 끊겼다가 곧바로 복구되는 현상을 ___네트워크 순단___, ___[Network Blip](https://www.urbandictionary.com/define.php?term=network%20blip)___ 이라고 한다.

![](/resource/wiki/network-blip/blip-meaning.png)

Client -> ServerA -> ServerB  흐름으로 요청이 이뤄진다고 했을때, ServerB 에서 MongoDB Version Upgrade 로 인해 네트워크 순단이 일어난다고 했을때, Client 와 ServerA 는 어떤식으로 대응을 할 수 있을까?

## Strategies for Handling Network Blips

### Retry Mechanism

Client 와 ServerA 는 요청 실패 시 자동으로 재시도하는 로직을 구현할 수 있다.
___[지수 백오프(Exponential Backoff)](https://en.wikipedia.org/wiki/Exponential_backoff)___ 전략을 사용하여 재시도 간격을 점진적으로 늘릴 수 있다.

### Circuit Breaker Pattern

ServerA 에 ___[서킷 브레이커(Circuit Breaker Pattern)](https://baekjungho.github.io/wiki/architecture/architecture-circuit-breaker/)___ 를 구현하여 ServerB의 연속적인 실패를 감지하고 일시적으로 요청을 차단할 수 있다.
이는 시스템 과부하를 방지하고 빠른 실패(Fail Fast) 처리를 가능하게 한다.

### Timeout Configuration

Client 와 ServerA 는 적절한 ___타임아웃(Timeout)___ 을 설정하여 응답이 없는 경우를 처리할 수 있다.
너무 긴 타임아웃은 리소스 낭비를, 너무 짧은 타임아웃은 불필요한 재시도를 유발할 수 있으므로 적절한 값 설정이 중요하다.

### Fallback

___[Fallback](https://baekjungho.github.io/wiki/architecture/architecture-circuit-breaker/)___ 은 호출 당하는 서비스에서 위와 같은 문제가 발생했을때, 호출한 서비스에게 예외를 주는 것이 아닌 대체 로직을 실행해서 결과를 내주도록 하기 위한 매커니즘을 의미한다.

ServerB에 연결할 수 없을 때 사용할 수 있는 대체 로직이나 캐시된 데이터를 준비한다.
이를 통해 부분적인 기능이라도 계속 제공할 수 있다.

### Asynchronous Processing

요청을 ___[비동기적으로 처리(Asynchronous Processing)](https://baekjungho.github.io/wiki/architecture/architecture-async-nonblocking/)___ 하여 즉각적인 응답이 필요하지 않은 작업은 지연 처리할 수 있다.

### Logging & Monitoring

- 상세한 로깅을 통해 문제 발생 시 빠르게 원인을 파악하고 대응할 수 있다.
- 실시간 모니터링을 통해 네트워크 순단을 즉시 감지하고 알림을 받을 수 있다.

### Graceful Degradation

___[우아한 성능 저하, 優雅-性能低下, Graceful Degradation](https://johngrib.github.io/wiki/jargon/graceful-degradation/)___ 은 일부 장치나 서브시스템에 고장이나 오동작이 나타났을 때 시스템을 축소 구성하여 운전을 계속하면서 시스템이 파국적으로 고장나지 않도록 하는 방식을 말한다.

ServerB 의 일부 기능만 사용할 수 없는 경우, 나머지 기능은 계속 제공하는 방식으로 시스템을 설계한다. 

### ClientSide Caching

Client 에서 가능한 데이터를 캐싱하여 일시적인 연결 문제 시 캐시된 데이터를 사용할 수 있다.