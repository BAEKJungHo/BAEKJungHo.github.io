---
layout  : wiki
title   : Why Randomized Exponential Backoff Is Essential for Distributed Systems
summary : 
date    : 2025-06-25 15:02:32 +0900
updated : 2025-06-25 15:12:24 +0900
tag     : algorithm jitter distributed
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Why Randomized Exponential Backoff Is Essential for Distributed Systems

___[Exponential Backoff](https://en.wikipedia.org/wiki/Exponential_backoff)___ 는  is a common strategy for handling retries of failed network calls.

```
wait_interval = base * multiplier^n
```

기본적으로 위 처럼 처리하게 되면 1초 → 2초 → 4초 → 8초 ... 와 같은 일정한 간격으로 재시도를 처리한다.
하지만 모든 클라이언트가 동시에 실패하고 동일한 백오프 로직을 따르게 되면, 다음 재시도도 동시에 몰리게 되는 문제가 생긴다.
이를 ___동기화된 재시도 폭발(Synchronized Retry Storm)___ 이라고 한다.

___Jitter___ 이러한 동시성 문제를 피하기 위해 각 클라이언트의 대기 시간에 약간의 ___무작위성(random delay)___ 을 추가함으로써, 다음과 같은 장점을 가진다.
- 재시도 타이밍 분산 → 동시에 재시도하지 않아 서버에 과부하를 주지 않음
- 충돌 방지 (Collision Avoidance) → 리소스를 동시에 요청하는 클라이언트 간의 충돌 회피
- 시스템 안정성 향상 → 전체 시스템에 과도한 부하 없이 점진적 회복 가능
- 트래픽 과부하를 방지하기 위해서 재시도 로직에서 지수 백오프(Exponential Backoff)

[Google Cloud Incident Report – 2025-06-13](https://status.cloud.google.com/incidents/ow5i3PPK96RduMcb1SsW)
를 통해서 알 수 있듯이 us-central-1 처럼 큰 리전에서는 수십만~수백만 개의 클라이언트가 똑같이 재시도하게 된다.
어떤 장애나 오류가 발생하면, 수많은 클라이언트가 동시에 같은 리소스를 재시도하거나 요청하게 되며, 이를 ___Herd Effect(떼 효과)___ 라고 부른다.

Exponential Backoff 에 Jitter(randomize) 를 추가한 Randomized Exponential Backoff 가
타이밍을 랜덤하게 하고, 클라이언트들이 한 시점에 몰리는 것을 방지하여 트래픽 과부하를 막을 수 있다.

__Randomize Exponential Backoff Example__:

```kotlin
val baseDelay = 2.0.pow(retryCount) * 1000  // 예: 2^3 = 8초
val jitter = Random.nextDouble(0.5, 1.5)     // 지터: ±50% 무작위
val finalDelay = baseDelay * jitter
```

__Full Jitter Algorithm__:

```
sleep = random_between(0, min(cap, base * 2 ** attempt))
```

- `base * 2 ** attempt` 는 지수적으로 증가하는 최대 대기 시간
- cap 은 최대 대기 시간 상한선 (일정 수준 이상은 무작위 대기 시간이 더 증가하지 않음)
- random_between(0, X)는 0부터 X 사이의 무작위 값

## Links

- [Exponential Backoff And Jitter - AWS Architecture Blog](https://aws.amazon.com/ko/blogs/architecture/exponential-backoff-and-jitter/)
- [Better Retries with Exponential Backoff and Jitter](https://www.baeldung.com/resilience4j-backoff-jitter)