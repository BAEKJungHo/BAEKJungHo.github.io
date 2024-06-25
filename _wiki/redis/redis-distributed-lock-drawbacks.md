---
layout  : wiki
title   : Drawbacks of Distributed Lock
summary : 
date    : 2024-06-25 13:15:32 +0900
updated : 2024-06-25 13:55:24 +0900
tag     : redis lock distributed
toc     : true
comment : true
public  : true
parent  : [[/redis]]
latex   : true
---
* TOC
{:toc}

## Drawbacks of Distributed Lock

분산 락을 사용하면 데이터가 특정 시간(락의 대기 시간(wait time)과 임대 시간(lease time))에 의존하게 된다.
따라서, 필수적으로 처리해야 할 데이터가 처리되지 않는 상황이 발생할 수 있다. 또한, 락이 해제될 때 두 개의 데이터가 락을 경합하면 순서대로 처리되지 않을 가능성도 있다.

## Sequential events

대량의 트래픽이 발생하는 __순서가 보장되어야 하는 선/후행 관계가 중요한 이벤트__ 에서 고려할 수 있는 몇 가지 아이디어:
- __NoSQL__ - 시계열 데이터를 비동기로 빠르게 처리할 수 있는 구조, 높은 처리량과 스케일 아웃
- __멱등성__ - 장애로 인한 데이터 중복이나 누락을 처리하는 정책을 수립하여 플랫폼의 정합성을 보장
- __Kafka__ - 높은 처리량 및 배포나 장애로 인한 특정 서버의 순단 대처 가능한 구조
    - Event Driven 을 사용하면 Batch 성 로직을 제거할 수 있음

## Links

- [FMS(Fleet Management System) 주행이벤트 파이프라인 개선기](https://tech.socarcorp.kr/dev/2024/06/11/fms-trip-event-pipeline.html#%EC%8B%A4%EC%8B%9C%EA%B0%84%EC%9C%BC%EB%A1%9C-%EB%93%A4%EC%96%B4%EC%98%A4%EB%8A%94-%EB%8C%80%EB%9F%89%EC%9D%98-%EB%8D%B0%EC%9D%B4%ED%84%B0%EC%97%90-%EC%A0%81%ED%95%A9%ED%95%98%EC%A7%80-%EB%AA%BB%ED%95%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%86%8C%EC%8A%A4)
- [WMS 재고 이관을 위한 분산락 사용기](https://techblog.woowahan.com/17416/)