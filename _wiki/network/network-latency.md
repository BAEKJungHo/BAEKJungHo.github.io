---
layout  : wiki
title   : Tail Latency Amplification
summary : Latency Time, Response Time and Service Level Objective(SLO)
date    : 2023-11-05 15:54:32 +0900
updated : 2023-11-05 20:15:24 +0900
tag     : network monitoring
toc     : true
comment : true
public  : true
parent  : [[/network]]
latex   : true
---
* TOC
{:toc}

## Latency Time

지연 시간(latency time)은 요청이 처리되길 기다리는 시간으로 서비스를 기다리며 휴지(latent) 상태인 시간을 의미한다.

## Response Time

응답 시간(response time)은 클라이언트의 요청을 처리하는 실제 시간(네트워크 지연 시간 포함)을 의미한다. 즉, 응답을 받기 까지의 시간을 말한다.

## ResponseTime Monitoring

평균 응답 시간을 측정할 때 산술 평균(arithmetic mean)은 적절하지 않다. 얼마나 많은 사용자가 실제로 지연을 경험했는지 알 수 없다.
따라서 __백분위(percentile)__ 를 사용하는 편이 좋다.

가장 빠른 시간 부터 느린 시간 까지 정렬을 하면 __중앙값(median)__ 은 50번째 백분위수이다. `p50` 이라고 표현한다. p50 이 100ms 라면 100개 요청 중 50개 정도는 100ms 미만이고 나머지 절반은 100ms 이상 걸린다고 보면된다.

p95 가 1.5초 라면 100개 요청 중 95개는 1.5초 미만이고 나머지 5개는 1.5초 이상 걸린다고 보면된다.

상위 백분위 응답 시간을 __꼬리 지연 시간(tail latency)__ 라고 하며, 이는 서비스의 사용자 경험에 직접 영향을 주기 때문에 중요하다.

이러한 백분위는 __서비스 수준 목표(service level objective, SLO)__ 에 자주 사용된다.

## Tail Latency Amplification

꼬리 지연 증폭(tail latency amplification)은 사용자의 요청이 병렬로 처리되고 있을때, 하나만 느려도 응답 시간이 결국 느려지게 된다.
예를 들어 5개가 병렬로 처리되고 있고 4개가 50ms 내에 처리되었지만 1개가 1초 걸리면, 최종 응답 시간은 1초이다.

한마디로, __단 하나의 느린 백엔드 요청이 응답 시간을 느리게 만든다.__

## References

- Designing Data-Intensive Applications / Martin Kleppmann / O'REILLY 