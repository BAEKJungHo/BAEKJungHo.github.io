---
layout  : wiki
title   : Consumer Options Optimization Strategy
summary : 
date    : 2024-03-12 20:54:32 +0900
updated : 2024-03-12 21:15:24 +0900
tag     : kafka eventdriven
toc     : true
comment : true
public  : true
parent  : [[/kafka]]
latex   : true
---
* TOC
{:toc}

## Consumer Options Optimization Strategy

### ZERO PAYLOAD

__[ZERO PAYLOAD](https://baekjungho.github.io/wiki/architecture/architecture-zero-payload/)__ 를 사용하고 있으며 데이터의 최종 일관성만 보장하면 되는 경우에 사용할 수 있는 전략

![](/resource/wiki/kafka-consumer-options-strategy/zero-payload.png)

__[offset management](https://docs.confluent.io/platform/current/clients/consumer.html#offset-management)__:
- auto-offset-reset
  - latest: 카프카에서 초기 오프셋이 없거나, 현재 오프셋이 더 이상 존재하지 않은 경우 최근 offset 을 기준
- enable-auto-commit: true(“at least once” delivery, rebalancing 시 메시지 중복 처리 될 수 있음)
  - [Rebalancing](https://medium.com/@greg.shiny82/%EC%8B%A4%EB%AC%B4-%EA%B4%80%EC%A0%90%EC%97%90%EC%84%9C%EC%9D%98-apache-kafka-%ED%99%9C%EC%9A%A9-023d468f9182)
- max-poll-records: N (단일 poll 에 가져올 메시지 수)

ZERO PAYLOAD 를 사용하고 있는 경우, at least once 전략을 사용해도 괜찮다. event 를 받아서 API 를 호출하여 데이터의 최종 상태만 동기화 해주면 되기 때문이다.

여기서 추가로 고민해야할 부분은 아래와 같다. (서비스 성격, 내부 구현등에 따라 달라진다.)

- __Not consumed Events__
  - 특정 이유로 인해 메시지가 쌓여있는 경우
- __Failed Events__
  - Consumer 에서 데이터 최종 상태 동기화를 진행 중인 과정에서 Exceptions 등으로 인해, 동기화에 실패한 경우

## Links

- [APACHE KAFKA QUICKSTART](https://kafka.apache.org/quickstart)
- [Kafka Consumer Options - Goodgid](https://goodgid.github.io/Kafka-Consumer-Option/)
- [Kafka 운영자가 말하는 Kafka Consumer Group](https://www.popit.kr/kafka-consumer-group/)

## References

- [Kafka Consumer Docs](https://docs.confluent.io/platform/current/clients/consumer.html)