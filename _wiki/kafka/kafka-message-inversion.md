---
layout  : wiki
title   : Message Inversion
summary : 
date    : 2024-11-30 11:54:32 +0900
updated : 2024-11-30 12:15:24 +0900
tag     : kafka
toc     : true
comment : true
public  : true
parent  : [[/kafka]]
latex   : true
---
* TOC
{:toc}

## Message Inversion

카프카(Kafka)에서 메시지 역전(Message Inversion) 현상은 분산 메시징 시스템에서 발생할 수 있는 중요한 문제이다.

카프카에서는 같은 파티션에 대해서 프로듀서가 보낸 데이터의 순서를 보장한다.
하지만 멀티 파티션 또는 멀티 컨슈머 환경에서는 메시지 역전 현상(메시지들이 원래의 순서와 다르게 소비되는 현상)이 발생할 수 있다.

__주요 발생 원인 by Claude__:
- 네트워크 지연
- 병렬 처리
- 다른 처리 속도를 가진 컨슈머들
- 파티셔닝 전략

__이를 방지하기 위한 해결 방법 by Claude__:
- 메시지에 타임스탬프 추가
- 시퀀스 번호 부여
- 단일 컨슈머 사용
- 순서 보장 메커니즘 구현

Key 를 사용하여 ___메시지 순서 보장___ 을 할 수 있다.

![](/resource/wiki/kafka-message-inversion/kafka-key.png)

## Links

- [우리 팀은 카프카를 어떻게 사용하고 있을까](https://techblog.woowahan.com/17386/)